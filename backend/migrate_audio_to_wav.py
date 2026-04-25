"""
Migration: Convert all existing non-WAV audio files in S3 to WAV.
Requires: ffmpeg installed on the server (pip install ffmpeg-python)

Run: python migrate_audio_to_wav.py
"""
import os
import subprocess
import tempfile
from pathlib import Path

from app.sessions.db import SessionLocal
from app.models.case_file import CaseFile
from app.utils.s3_utils import s3_client, AWS_S3_BUCKET


def convert_to_wav(input_path: str, output_path: str) -> bool:
    """Convert any audio file to 44100Hz mono WAV using ffmpeg."""
    try:
        result = subprocess.run([
            "ffmpeg", "-y",
            "-i", input_path,
            "-ar", "44100",
            "-ac", "1",
            "-sample_fmt", "s16",
            output_path
        ], capture_output=True, timeout=60)
        return result.returncode == 0
    except Exception as e:
        print(f"  ffmpeg error: {e}")
        return False


def migrate():
    db = SessionLocal()
    try:
        # Find all audio files that are NOT already wav
        audio_files = db.query(CaseFile).filter(
            CaseFile.modality.in_(["cough_audio", "breath_audio"]),
            CaseFile.file_type != "wav"
        ).all()

        print(f"Found {len(audio_files)} non-WAV audio files to convert.\n")

        success, failed = 0, 0

        for cf in audio_files:
            print(f"[Case {cf.case_id}] {cf.modality} | {cf.file_type} | {cf.s3_key}")

            with tempfile.TemporaryDirectory() as tmpdir:
                input_path = os.path.join(tmpdir, f"input.{cf.file_type}")
                output_path = os.path.join(tmpdir, "output.wav")

                # Download from S3
                try:
                    s3_client.download_file(AWS_S3_BUCKET, cf.s3_key, input_path)
                except Exception as e:
                    print(f"  ✗ Download failed: {e}\n")
                    failed += 1
                    continue

                # Convert to WAV
                if not convert_to_wav(input_path, output_path):
                    print(f"  ✗ Conversion failed\n")
                    failed += 1
                    continue

                # Build new S3 key (replace extension with .wav)
                new_s3_key = str(Path(cf.s3_key).with_suffix(".wav"))

                # Upload converted WAV to S3
                try:
                    with open(output_path, "rb") as f:
                        s3_client.put_object(
                            Bucket=AWS_S3_BUCKET,
                            Key=new_s3_key,
                            Body=f,
                            ContentType="audio/wav",
                            ContentDisposition="inline"
                        )
                except Exception as e:
                    print(f"  ✗ Upload failed: {e}\n")
                    failed += 1
                    continue

                # Delete old S3 object
                try:
                    s3_client.delete_object(Bucket=AWS_S3_BUCKET, Key=cf.s3_key)
                except Exception as e:
                    print(f"  ⚠ Old file delete failed (non-critical): {e}")

                # Update DB record
                cf.s3_key = new_s3_key
                cf.file_type = "wav"
                db.commit()

                print(f"  ✓ Converted → {new_s3_key}\n")
                success += 1

        print(f"\nDone. ✓ {success} converted, ✗ {failed} failed.")

    finally:
        db.close()


if __name__ == "__main__":
    migrate()
