import { promises as fs } from 'fs';

interface ServiceFile {
  name: string;
  description: string;
  exec: {
    start: string;
    stop?: string;
    restart?: string;
    reload?: string;
  },
  workingDirectory: string;
  waitForNetwork?: boolean
}

export async function write({ name, description, exec, workingDirectory, waitForNetwork }: ServiceFile) {
  const file = `
[Unit]
Description=${description}
${!waitForNetwork ? '' : `Wants=network-online.target\nAfter=network-online.target`}

[Service]
Restart=always
ExecStart=${exec.start}
WorkingDirectory=${workingDirectory}

[Install]
WantedBy=multi-user.target
  `.trim();

  await fs.writeFile(`${name}.service`, file);
}