import * as fs from 'fs';
import * as path from 'path';

export class RouteTable extends Map<RegExp, Function> {
    match (method : String, url : String) {
        // TODO: memoize

        const signature = `${method.toUpperCase()} ${url}`;
        for (const [regex, handler] of this.entries()) {
            const match = regex.exec(signature);

            if (match) {
                return { match, handler };
            }

        }
        return null;
    }
}

export function loadRoutes (envPath = process.cwd()): RouteTable {
    const routeDir = path.resolve(envPath, 'routes');
    const routes = readDir(routeDir);

    const routeTable = new RouteTable();
    for (const route of routes) {

        const { dir, name } = path.parse(route);

        const pathName = path.resolve('/', dir.replace(routeDir, ''), name);

        const mod = require(route);

        mod.index   && routeTable.set(new RegExp(`GET ${pathName}$`),                 mod.index);
        mod.create  && routeTable.set(new RegExp(`POST ${pathName}$`),                mod.create);
        mod.show    && routeTable.set(new RegExp(`GET ${pathName}/(?<id>[^/]+)$`),    mod.show);
        mod.update  && routeTable.set(new RegExp(`PUT ${pathName}/(?<id>[^/]+)$`),    mod.update);
        mod.update  && routeTable.set(new RegExp(`PATCH ${pathName}/(?<id>[^/]+)$`),  mod.update);
        mod.destroy && routeTable.set(new RegExp(`DELETE ${pathName}/(?<id>[^/]+)$`), mod.destroy);
    }

    return routeTable;
}

export function readDir (dir) {
    const entities = fs.readdirSync(dir, { withFileTypes: true });
    const childPaths = entities.map(entity => {
        const childPath = path.resolve(dir, entity.name);
        return entity.isDirectory() ? readDir(childPath) : childPath;
    })
    return Array.prototype.concat(...childPaths);
}
