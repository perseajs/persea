import { EventEmitter } from 'events';
import { promises as fs, FSWatcher, watch } from 'fs';
import * as path from 'path';

// we want something that notifies on file add/change/removal.
// we want a simple implementation
// we are willing to accept a less-than-ideal implementation for a given host,
// if that means we have a single implementation

export class Watcher extends EventEmitter {
  dirs = [];
  watchers: { [dir : string]: FSWatcher } = {};
  ignore: Array<RegExp> = [];

  constructor (options? : { ignore?: Array<RegExp> }) {
    super();

    if (options?.ignore) this.ignore = options.ignore;
  }

  async listen (dir : string) {
    for await (const node of walk(dir, this.ignore)) {
      if (shouldIgnore(this.ignore, node)) continue;
      if ((await fs.stat(node)).isDirectory() === false) continue;

      this.watchers[node] = watch(node, async (event, childname) => {
        const childPath = path.resolve(node, childname)

        this.emit(event, childPath);

        if (this.watchers[childPath] !== undefined) return;
        try {
          if ((await fs.stat(childPath)).isDirectory() === false) return;
        } catch (e) {
          if (e.code === 'ENOENT') return;
          throw e;
        }

        this.listen(childPath);
      });
    }
  }

}

export async function* walk (dir : string, ignore : Array<RegExp> = []) {
    const queue = [ path.resolve(dir) ];

    while (queue.length > 0) {
        const entity = queue.shift();

        yield entity;

        const stat = await fs.stat(entity);
        if (stat.isDirectory()) {
            for (const child of await fs.readdir(entity)) {
                if (shouldIgnore(ignore, child)) continue;
                queue.push(path.resolve(entity, child));
            }
        }
    }
}

function shouldIgnore (ignore : Array<RegExp> = [], path : string) {
  return ignore.some(rgx => rgx.test(path));
}
