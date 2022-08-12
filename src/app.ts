import which from "which";
import inquirer from "inquirer";
import cla from "command-line-args";
import data from "./package-data";
import { Service, store } from "./service-file";
const { name, description, main } = data;

const _options = [
  { name: "skip", alias: "y", type: Boolean, defaultValue: false },
  { name: "start", type: Boolean, defaultValue: false },
  { name: "stop", type: Boolean, defaultValue: false },
  { name: "restart", type: Boolean, defaultValue: false },
  { name: "reload", type: Boolean, defaultValue: false },
  { name: "status", type: Boolean, defaultValue: false },
];

const options = cla(_options);

const keys = _options.map((option) => option.name);

const questions = [
  {
    type: "string",
    name: "name",
    message: "Service name",
    default: name,
    validate: (value: string) => !value.includes(" "),
  },
  {
    type: "string",
    name: "description",
    message: "Service description",
    default: description,
  },
  {
    type: "string",
    name: "bin",
    message: "Node path",
    default: which.sync("node", { nothrow: true }) ?? "",
  },
  {
    type: "string",
    name: "entry",
    message: "Entry script",
    default: main,
  },
  {
    type: "string",
    name: "cwd",
    message: "Applications working directory",
    default: process.cwd(),
  },
  {
    type: "confirm",
    name: "enable",
    message: "Run service on boot?",
    default: true,
  },
  {
    type: "confirm",
    name: "restart",
    message: "Restart on exit?",
    default: true,
  },
  {
    type: "confirm",
    name: "waitForNetwork",
    message: "Should this application wait for the network before starting?",
    default: true,
  },
];

const defaults = questions.reduce((o: any, c) => {
  o[c.name] = c.default;
  return o;
}, {});

(async function () {
  const saved = await store();
  const key = keys.find((key) => options[key]);
  if (key) {
    if (!saved.name) {
      console.error("No existing service found.");
      process.exit(0);
    }

    const service = new Service(saved.name);
    await (service as any)[key]();
  } else {
    const answers = options.skip ? defaults : await inquirer.prompt(questions);
    const {
      name,
      description,
      bin,
      entry,
      cwd,
      enable,
      restart,
      waitForNetwork,
    } = answers;

    const service = new Service(name);
    await service.write({
      description,
      exec: { start: `${bin} ${entry}` },
      waitForNetwork,
      restart,
      workingDirectory: cwd as string,
    });

    await service.reloadDaemon();
    if (enable) await service.enable();
  }
})();
