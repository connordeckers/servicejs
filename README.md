# ServiceJS
Helps turn a node application into a native Linux service file.

# Usage
At the moment, this package can only install system-wide services. As such, it will need to be run with `sudo`, meaning that it's recommended that you install globally (`npm i -g @connordeckers/servicejs`).

Once installed, run with `sudo servicejs` in your projects root directory (alongside your `package.json` file).

# Commands

- `servicejs`: Run the wizard
- `servicejs --skip`: Skip the wizard, use the defaults (best guesses)
- `servicejs --start`: Start the service
- `servicejs --stop`: Stop the service
- `servicejs --restart`: Restart the service
- `servicejs --reload`: Reload the service
- `servicejs --status`: Get the service status

# To do
- Make the service interactions check the existance of a service first.
- Allow user-level service generation. (allows use without sudo).
  - If running as sudo, allow for generation of both styles (system-level and user-level).
  - If not running as sudo, only create user-level.
  - Provide help guidelines on how to enable user-level services (including lingering).
    - See [this StackExchange post](https://unix.stackexchange.com/questions/462845/how-to-apply-lingering-immedeately) for more info
- Add and confirm support for other OS's
  - Currently only tested in Ubuntu