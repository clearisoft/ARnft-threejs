import Container from './utils/html/Container';
import Stats from 'stats.js';
import { CameraViewRenderer } from "./renderers/CameraViewRenderer";
import { getConfig } from "./utils/ARUtils";
import NFTWorker from './NFTWorker';
import { v4 as uuidv4 } from 'uuid';
import packageJson from '../package.json';
const { version } = packageJson;
export default class ARnft {
    constructor(width, height, configUrl) {
        this._fps = 15;
        this._lastTime = 0;
        this.width = width;
        this.height = height;
        this.configUrl = configUrl;
        this.uuid = uuidv4();
        this.version = version;
        console.log('ARnft ', this.version);
    }
    static async init(width, height, markerUrl, configUrl, stats, camera) {
        const _arnft = new ARnft(width, height, configUrl);
        return await _arnft.initialize(markerUrl, stats, camera).catch((error) => {
            console.error(error);
            return Promise.reject(false);
        });
    }
    async initialize(markerUrl, stats, camera) {
        console.log('ARnft init() %cstart...', 'color: yellow; background-color: blue; border-radius: 4px; padding: 2px');
        getConfig(this.configUrl);
        document.addEventListener('getConfig', async (ev) => {
            this.appData = ev.detail.config;
            console.log(this.appData);
            Container.createContainer(this.appData);
            Container.createLoading(this.appData);
            Container.createStats(this.appData.stats.createHtml, this.appData);
            let statsMain, statsWorker;
            if (stats) {
                statsMain = new Stats();
                statsMain.showPanel(0);
                document.getElementById('stats1').appendChild(statsMain.dom);
                statsWorker = new Stats();
                statsWorker.showPanel(0);
                document.getElementById('stats2').appendChild(statsWorker.dom);
            }
            this.cameraView = new CameraViewRenderer(document.getElementById("video"));
            await this.cameraView.initialize(this.appData.videoSettings).catch((error) => {
                console.error(error);
                return Promise.reject(false);
            });
            const worker = new NFTWorker(markerUrl, this.width, this.height, this.uuid);
            worker.initialize(this.appData.cameraPara, this.cameraView.getImage(), () => { });
            worker.process(this.cameraView.getImage());
            let update = () => {
                worker.process(this.cameraView.getImage());
                requestAnimationFrame(update);
            };
            update();
        });
        return Promise.resolve(this);
    }
    update(worker) {
        let time = Date.now();
        let imageData;
        if ((time - this._lastTime) > this._fps) {
            imageData = this.cameraView.getImage();
            console.log(imageData);
            this._lastTime = time;
        }
        if (imageData) {
            let update = () => {
                worker.process(imageData);
                requestAnimationFrame(update);
            };
            update();
        }
    }
}
//# sourceMappingURL=ARnft.js.map