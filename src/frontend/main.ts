module webgames {
    export class webgames {
        public glSession: WebGL.WebGL;

        constructor(domCanvasId: string) {
            this.glSession = new WebGL.WebGL("webgames-canvas");
        }
    }
}

var game: webgames.webgames;
function exec(): void {
    game = new webgames.webgames("webgames-canvas");
};
