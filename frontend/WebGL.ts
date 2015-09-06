module WebGL
{
	export class WebGL
	{
/* Attributes */
		private _gl;
		get gl() {
			return this._gl;
		}

		private _shaderProgram;
		get shaderProgram() {
			return this._shaderProgram;
		}

		private pyramidVertexPositionBuffer;
		private pyramidVertexColorBuffer;
		
		private cubeVertexPositionBuffer;
		private cubeVertexColorBuffer;
		private cubeVertexIndexBuffer;
		
		private squareVertexPositionBuffer;
		private squareVertexColorBuffer;
        private groundVertices;

        private rPyramid=0;
        private rCube=0;

/* Constructor */
		constructor(domCanvasId:string)
		{
			var canvas = document.getElementById(domCanvasId);
			this.initGL(canvas);
			this.initShaders();
/*************************************************/
			this.demoBuffers();
/*************************************************/
			this._gl.clearColor(0.4, 0.5, 1.0, 0.5);
			this._gl.enable(this._gl.DEPTH_TEST);
		
			this.tick();
		}

		private getShader(id, type) {
            var gl=this._gl;
			var shaderScript = document.getElementById(id);
			if (!shaderScript) {
				return null;
			}

			var str = shaderScript.textContent;

			var shader;
			if (type=="fragment-shader") {
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			} else if (type=="vertex-shader") {
				shader = gl.createShader(gl.VERTEX_SHADER);
			} else {
				return null;
			}

			gl.shaderSource(shader, str);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}

			return shader;
		}

		private drawScene() {
            var gl=this._gl;
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            var perspMat:LinAlg.mat=new LinAlg.mat(4);
            perspMat.m4persp3d(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)

			var mvMatrix:LinAlg.mat = new LinAlg.mat(4);
            mvMatrix.translate(-6.0, -4.5, -10.9);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
			gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexColorBuffer);
			gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, perspMat.raw);
			gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, mvMatrix.raw);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.squareVertexPositionBuffer.numItems);
			
			mvMatrix.translate(this.groundVertices[(6*Math.round(this.rPyramid/1)+0)%this.groundVertices.length], this.groundVertices[(6*Math.round(this.rPyramid/1)+4)%this.groundVertices.length]-1.8, 0.0);
            var l=mvMatrix.clone();

			l.m4rotate3d(this.rPyramid, [0, 1, 0]);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.pyramidVertexPositionBuffer);
			gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.pyramidVertexColorBuffer);
			gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, perspMat.raw);
			gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, l.raw);

			gl.drawArrays(gl.TRIANGLES, 0, this.pyramidVertexPositionBuffer.numItems);

            l=mvMatrix.clone();
			l.translate(0.0, 0,0);
			l.m4rotate3d(this.rCube, [0, 2, 0]);
			l.translate(-3.0, 0.0, 0.0);
			l.m4rotate3d(this.rCube, [0, 0, 1]);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
			gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexColorBuffer);
			gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);

			gl.uniformMatrix4fv(this._shaderProgram.pMatrixUniform, false, perspMat.raw);
			gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, l.raw);

			gl.drawElements(gl.TRIANGLES, this.cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}

        private lastTime:number = 0;
		private animate() {
			var timeNow = new Date().getTime();
			if (this.lastTime != 0) {
				var elapsed = timeNow - this.lastTime;
				this.rPyramid += (90 * elapsed) / 1000.0;
				this.rCube -= (75 * elapsed) / 1000.0;
			}
			this.lastTime = timeNow;
		}

        private tick() {
			requestAnimationFrame(()=>this.tick());
			this.drawScene();
			this.animate();
		}

		private initShaders() {
            var gl=this._gl;

			var fragmentShader = this.getShader("shader-fs", "fragment-shader");
			var vertexShader = this.getShader("shader-vs", "vertex-shader");

			var shaderProgram=(this._shaderProgram = gl.createProgram());
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
				alert("Could not initialise shaders");
			}

			gl.useProgram(shaderProgram);

			shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
			gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

			shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
			gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

			shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
			shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		}

		private initGL(canvas) {
			if(this._gl!=null) return this._gl;
	
			try {
				this._gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
				this._gl.viewportWidth = canvas.width;
				this._gl.viewportHeight = canvas.height;
			} catch (e) {}
			if(this._gl==null)  {
				alert("Could not initialise WebGL, sorry :-(");
			}
			return this._gl;
		}

		private demoBuffers() {
            var gl=this._gl;

       		var groundVertices=new Array(6*1024);

		    var pyramidVertexPositionBuffer;
		    var pyramidVertexColorBuffer;
		
		    var cubeVertexPositionBuffer;
		    var cubeVertexColorBuffer;
		    var cubeVertexIndexBuffer;
		
		    var squareVertexPositionBuffer;
		    var squareVertexColorBuffer;


			squareVertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);

			for(var v=0;v<6*1024;v+=6)
			{
				groundVertices[v+0]=0;
				groundVertices[v+1]=0;
				groundVertices[v+2]=0;

				groundVertices[v+3]=0;
				groundVertices[v+4]=40;
				groundVertices[v+5]=0;
			}

			for(var i=0;i<5;i++)
			{
				var phase=Math.random();
				var strength=2+Math.random();
				
				for(v=0;v<6*1024;v+=6)
				{
					var h0=Math.cos(2*Math.PI*(v/(1024*8))*i+phase*v/500);

					groundVertices[v+0]=2*v/1024;
					groundVertices[v+1]=0;
					groundVertices[v+2]=0;

					groundVertices[v+3]=2*v/1024;
					groundVertices[v+4]+=h0;
					groundVertices[v+5]=0;
				}
			}
			
			for(v=0;v<6*1024;v+=6)
			{
				groundVertices[v+4]/=10;
			}

			vertices = groundVertices;

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			squareVertexPositionBuffer.itemSize = 3;
			squareVertexPositionBuffer.numItems = (2*1024);
			squareVertexColorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
			var colors:any[]=[];
			for (var i=0; i < (2*1024); i++) {
				colors = colors.concat([0.6, 0.8, 0.3, 1.0]);
			}
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
			squareVertexColorBuffer.itemSize = 4;
			squareVertexColorBuffer.numItems = (2*1024);

			pyramidVertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
			var vertices = [
				// Front face
				0.0, -0.1,  0.0,
               -0.1,  0.2,  0.1,
                0.1,  0.2,  0.1,

				// Right face
                0.0,  -0.1,  0.0,
                0.1,   0.2,  0.1,
                0.1,   0.2, -0.1,

				// Back face
                 0.0, -0.1,  0.0,
                 0.1,  0.2, -0.1,
                -0.1,  0.2, -0.1,

				// Left face
                 0.0, -0.1,  0.0,
                -0.1,  0.2, -0.1,
                -0.1,  0.2,  0.1,
                
                //Bottom
                -0.1,  0.2,  0.1,
                 0.1,  0.2,  0.1,
                 0.1,  0.2, -0.1,

                -0.1,  0.2,  0.1,
                -0.1,  0.2, -0.1,
                 0.1,  0.2, -0.1
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			pyramidVertexPositionBuffer.itemSize = 3;
			pyramidVertexPositionBuffer.numItems = 18;

			pyramidVertexColorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
			colors = [
				// Front face
				1.0, 0.0, 0.0, 1.0,
				1.0, 1.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,

				// Right face
				1.0, 0.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				0.0, 1.0, 0.0, 1.0,

				// Back face
				1.0, 0.0, 0.0, 1.0,
				0.0, 1.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,

				// Left face
				1.0, 0.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				1.0, 1.0, 0.0, 1.0,

				// Bottom face
				1.0, 1.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				0.0, 1.0, 0.0, 1.0,

				1.0, 1.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				0.0, 1.0, 0.0, 1.0
			];

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
			pyramidVertexColorBuffer.itemSize = 4;
			pyramidVertexColorBuffer.numItems = 1;

			cubeVertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
			vertices = [
				// Front face
				-1.0, -1.0,  1.0,
				 1.0, -1.0,  1.0,
				 1.0,  1.0,  1.0,
				-1.0,  1.0,  1.0,

				// Back face
				-1.0, -1.0, -1.0,
				-1.0,  1.0, -1.0,
				 1.0,  1.0, -1.0,
				 1.0, -1.0, -1.0,

				// Top face
				-1.0,  1.0, -1.0,
				-1.0,  1.0,  1.0,
				 1.0,  1.0,  1.0,
				 1.0,  1.0, -1.0,

				// Bottom face
				-1.0, -1.0, -1.0,
				 1.0, -1.0, -1.0,
				 1.0, -1.0,  1.0,
				-1.0, -1.0,  1.0,

				// Right face
				 1.0, -1.0, -1.0,
				 1.0,  1.0, -1.0,
				 1.0,  1.0,  1.0,
				 1.0, -1.0,  1.0,

				// Left face
				-1.0, -1.0, -1.0,
				-1.0, -1.0,  1.0,
				-1.0,  1.0,  1.0,
				-1.0,  1.0, -1.0
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			cubeVertexPositionBuffer.itemSize = 3;
			cubeVertexPositionBuffer.numItems = 24;

			cubeVertexColorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
			var pcolors = [
				[1.0, 0.0, 0.0, 1.0], // Front face
				[1.0, 1.0, 0.0, 1.0], // Back face
				[0.0, 1.0, 0.0, 1.0], // Top face
				[1.0, 0.5, 0.5, 1.0], // Bottom face
				[1.0, 0.0, 1.0, 1.0], // Right face
				[0.0, 0.0, 1.0, 1.0]  // Left face
			];
			var unpackedColors = [];
			for (var i=0;i<pcolors.length;i++) {
				var color = pcolors[i];
				for (var j=0; j < 4; j++) {
					unpackedColors = unpackedColors.concat(color);
				}
			}
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
			cubeVertexColorBuffer.itemSize = 4;
			cubeVertexColorBuffer.numItems = 24;

			cubeVertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
			var cubeVertexIndices = [
				0, 1, 2,      0, 2, 3,    // Front face
				4, 5, 6,      4, 6, 7,    // Back face
				8, 9, 10,     8, 10, 11,  // Top face
				12, 13, 14,   12, 14, 15, // Bottom face
				16, 17, 18,   16, 18, 19, // Right face
				20, 21, 22,   20, 22, 23  // Left face
			];
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
			cubeVertexIndexBuffer.itemSize = 1;
			cubeVertexIndexBuffer.numItems = 36;

       		this.groundVertices=groundVertices;

		    this.pyramidVertexPositionBuffer=pyramidVertexPositionBuffer;
		    this.pyramidVertexColorBuffer=pyramidVertexColorBuffer;
		
		    this.cubeVertexPositionBuffer=cubeVertexPositionBuffer;
		    this.cubeVertexColorBuffer=cubeVertexColorBuffer;
		    this.cubeVertexIndexBuffer=cubeVertexIndexBuffer;
		
		    this.squareVertexPositionBuffer=squareVertexPositionBuffer;
		    this.squareVertexColorBuffer=squareVertexColorBuffer;        
        }
	}
}
