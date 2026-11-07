import os
import subprocess
import sys
import time
import paramiko

def deploy():
    host = '187.7.20.123'
    username = 'root'
    password = "3FPw#'1Uw2AA@y@O"
    archive_path = "deploy_frontend.tar.gz"
    remote_archive = "/tmp/frontend_deploy.tar.gz"

    frontend_dir = os.path.dirname(os.path.abspath(__file__))

    print("Step 1/5: Creating git archive from frontend local 'main' branch...")
    res = subprocess.run(["git", "archive", "--format=tar.gz", "-o", archive_path, "main"], cwd=frontend_dir, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Failed to create git archive: {res.stderr}")
        return

    full_archive_path = os.path.join(frontend_dir, archive_path)
    archive_size_mb = os.path.getsize(full_archive_path) / (1024 * 1024)
    print(f"Frontend archive created ({archive_size_mb:.2f} MB).")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"Step 2/5: Connecting to VPS {host}...")
        client.connect(hostname=host, username=username, password=password, timeout=15)
        print("Connected.")

        print("Step 3/5: Uploading frontend archive to VPS via SFTP...")
        sftp = client.open_sftp()
        sftp.put(full_archive_path, remote_archive)
        sftp.close()
        print("Upload complete.")

        print("Step 4/5: Extracting files into /opt/nexucon-frontend...")
        extract_cmd = f"tar -xzf {remote_archive} -C /opt/nexucon-frontend && rm -f {remote_archive}"
        stdin, stdout, stderr = client.exec_command(extract_cmd)
        exit_code = stdout.channel.recv_exit_status()
        if exit_code != 0:
            print(f"Extraction failed: {stderr.read().decode('utf-8')}")
            return
        print("Extraction complete.")

        print("Step 5/5: Building and restarting frontend Docker container (nexucon-frontend)...")
        commands = [
            "cd /opt/nexucon-frontend",
            "docker compose build frontend",
            "docker stop nexucon-frontend || true",
            "docker rm nexucon-frontend || true",
            "docker compose up -d",
            "sleep 3",
            "docker ps | grep nexucon-frontend"
        ]
        cmd_str = " && ".join(commands)
        stdin, stdout, stderr = client.exec_command(cmd_str, get_pty=True)

        for line in iter(stdout.readline, ""):
            sys.stdout.buffer.write(line.encode('utf-8', errors='replace'))
            sys.stdout.flush()

        exit_status = stdout.channel.recv_exit_status()
        print(f"\nFrontend deployment completed with exit status: {exit_status}")

    except Exception as e:
        print(f"Error during frontend deployment: {e}")
    finally:
        client.close()
        if os.path.exists(full_archive_path):
            os.remove(full_archive_path)

if __name__ == "__main__":
    deploy()

