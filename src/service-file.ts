// import sudo from 'sudo-prompt';
import { promisify } from 'util';
import proc from 'child_process';
const exec = promisify(proc.exec);

import { promises as fs } from 'fs';
import path from 'path';
import { exists } from './utils';
import chalk from 'chalk';

interface ServiceFile {
  description: string;
  exec: {
    start: string;
    stop?: string;
    restart?: string;
    reload?: string;
  },
  workingDirectory: string;
  restart: boolean;
  waitForNetwork?: boolean
}

const run = async (cmd: string, verbose = false) => {
  try {
    const { stdout, stderr } = await exec(cmd);
    if (stdout && verbose) console.log('>>', stdout);
    if (stderr && verbose) console.error('!>>', stderr);
    return { stdout, stderr };
  } catch (e) {
    console.error(e.message);
  }
}

const storePath = path.resolve(process.cwd(), './.servicerc');;
export const store = async (): Promise<{ [key: string]: any }> => await exists(storePath) ? JSON.parse(await fs.readFile(storePath).then(res => res.toString())) : {};

const save = async (key: string, value: string | number | boolean | null) => {
  const data = await store();
  data[key] = value;
  await fs.writeFile(storePath, JSON.stringify(data));
}

export class Service {
  private name: string;

  constructor(name: string) {
    this.name = name.split('.service')[0];
  }

  public async write({ description, exec, workingDirectory, waitForNetwork, restart }: ServiceFile) {
    const file = `
[Unit]
Description=${description}
${!waitForNetwork ? '' : `Wants=network-online.target\nAfter=network-online.target`}

[Service]
${restart ? `Restart=always` : ''}
ExecStart=${exec.start}
WorkingDirectory=${workingDirectory}

[Install]
WantedBy=multi-user.target
`.trim();

    try {
      const local = `${process.cwd()}/${this.name}.service`;
      const remote = path.resolve('/etc/systemd/system', `${this.name}.service`);

      await save('name', `${this.name}.service`);
      await fs.writeFile(`${this.name}.service`, file);
      if (!await exists(remote)) {
        await run(`ln -s ${local} ${remote}`);
      }
    } catch (e) {
      console.error(chalk.red(e.message));
    }
  }

  public reloadDaemon(verbose = false) {
    return run('systemctl daemon-reload', verbose);
  }

  public enable(verbose = false) {
    return run(`systemctl enable ${this.name}.service`, verbose);
  }

  public disable(verbose = false) {
    return run(`systemctl disable ${this.name}.service`, verbose);
  }

  public start(verbose = false) {
    return run(`systemctl start ${this.name}.service`, verbose);
  }

  public stop(verbose = false) {
    return run(`systemctl stop ${this.name}.service`, verbose);
  }

  public restart(verbose = false) {
    return run(`systemctl restart ${this.name}.service`, verbose);
  }

  public reload(verbose = false) {
    return run(`systemctl reload ${this.name}.service`, verbose);
  }

  public log(verbose = false) {
    return run(`systemctl reload ${this.name}.service`, verbose);
  }

  public async status(verbose = false) {
    const data = await run(`systemctl status ${this.name}.service | grep Active:`, verbose);

    if (data?.stdout.toLowerCase().includes('inactive (dead)')) {
      console.log(chalk.blue('Status: '), chalk.white('offline'));
      return false;
    } else if (data?.stdout.toLowerCase().includes('failed')) {
      console.log(chalk.blue('Status: '), chalk.red('failed'));
      return false;
    } else if (data?.stdout.toLowerCase().includes(': active')) {
      console.log(chalk.blue('Status: '), chalk.green('active'));
      return true;
    } else {
      data?.stdout ? console.log(chalk.blue(data?.stdout)) : null;
      data?.stderr ? console.log(chalk.red(data?.stderr)) : null;
    }
  }
}