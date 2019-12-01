import which from 'which';
import inquirer from 'inquirer';
import cla from 'command-line-args';
import { exec } from 'child_process';

import data from './package-data';
import * as service from './service-file';
const { name, description, main } = data;

const options = cla([{ name: 'skip', alias: 'y', type: Boolean, defaultValue: false }])
const questions = [
  {
    type: 'string',
    name: 'name',
    message: 'Service name',
    default: name,
    validate: (value: string) => !value.includes(' ')
  },
  {
    type: 'string',
    name: 'description',
    message: 'Service description',
    default: description
  },
  {
    type: 'string',
    name: 'bin',
    message: 'Node path',
    default: which.sync('node', { nothrow: true }) ?? ''
  },
  {
    type: 'string',
    name: 'entry',
    message: 'Entry script',
    default: main
  },
  {
    type: 'string',
    name: 'cwd',
    message: 'Applications working directory',
    default: process.cwd()
  },
  {
    type: 'confirm',
    name: 'enable',
    message: 'Run service on boot?',
    default: true
  },
  {
    type: 'confirm',
    name: 'waitForNetwork',
    message: 'Should this application wait for the network before starting?',
    default: true
  }
];

const defaults = questions.reduce((o: any, c) => { o[c.name] = c.default; return o; }, {});

(async function () {
  const answers = options.skip ? defaults : await inquirer.prompt(questions);

  const { name, description, bin, entry, cwd, waitForNetwork } = answers;
  await service.write({
    name: name as string,
    description: description as string,
    exec: { start: `${bin} ${entry}` },
    waitForNetwork: waitForNetwork as boolean,
    workingDirectory: cwd as string
  });



})();