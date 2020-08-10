import * as Smilo from '@smilo-platform/smilo-commons-js-web';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';

export class NodeStorageManager implements Smilo.IStorageManager {
    constructor(private basePath: string = '') {

    }

    private fixPath(filePath: string): string {
        // Ensure base path exists
        mkdirp.sync(this.basePath);

        return path.join(this.basePath, filePath);
    }

    read(filePath: string): Promise<string> {
        filePath = this.fixPath(filePath);

        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (error, data) => {
                if (!error) {
                    resolve(data.toString());
                } else {
                    reject(error);
                }
            });
        });
    }
    write(filePath: string, data: string): Promise<void> {
        filePath = this.fixPath(filePath);

        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, (error) => {
                if (!error) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }

    readJSON<T>(filePath: string): Promise<T> {
        return this.read(filePath).then(
            (data) => JSON.parse(data)
        );
    }
    writeJSON(filePath: string, data: any): Promise<void> {
        return this.write(filePath, JSON.stringify(data));
    }

    remove(filePath: string): Promise<void> {
        filePath = this.fixPath(filePath);

        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (error) => {
                if (!error) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }
}
