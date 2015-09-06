module LinAlg {
    export class vec {
        private _SIZE;
        get SIZE() {
            return this._SIZE;
        }
        private _raw: Float32Array;
        get raw() {
            return this._raw;
        }
        constructor(vec) {
            this._SIZE = vec.length;
            this._raw = new Float32Array(this._SIZE);
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] = vec[i];
            }
        }
        public set(vec: vec) {
            if (vec.SIZE != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = vec.raw;
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] = v[i];
            }
        }
        public add(vec: vec) {
            if (vec.SIZE != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = vec.raw;
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] += v[i];
            }
        }
        public sub(vec: vec) {
            if (vec.SIZE != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = vec.raw;
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] -= v[i];
            }
        }
        public scale(val: number) {
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] *= val;
            }
        }
        public abs(): number {
            var n: number = 0;
            for (var i = 0; i < this._SIZE; i++) {
                n += this._raw[i] * this._raw[i];
            }
            n = Math.sqrt(n);
            return n;
        }

        public norm() {
            var n: number = this.abs();
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] /= n;
            }
        }

        public dot(vec: vec): number {
            var n: number = 0;
            if (vec.SIZE != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = vec.raw;
            for (var i = 0; i < this._SIZE; i++) {
                n += this._raw[i] * v[i];
            }
            return n;
        }

        public v3cross(vec: vec) {
            if (vec.SIZE != this._SIZE || this._SIZE != 3) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = vec.raw;

            var a = this._raw[1] * v[2] - this._raw[2] * v[1];
            var b = this._raw[2] * v[0] - this._raw[0] * v[2];
            var c = this._raw[0] * v[1] - this._raw[1] * v[0];
            this._raw[0] = a;
            this._raw[1] = b;
            this._raw[2] = c;
        }

        public clone(): vec {
            return new vec(this._raw);
        }
    }


    export class mat {
        private _SIZE;
        get SIZE() {
            return this._SIZE;
        }
        private _raw: Float32Array;
        get raw() {
            return this._raw;
        }

        constructor(size: number) {
            var n: number = Math.round(size);
            this._SIZE = Math.pow(n, 2);
            this._raw = new Float32Array(this._SIZE);
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    this._raw[i * n + j] = (i == j) ? 1 : 0;
                }
            }
        }

        public m4persp3d(fovy: number, aspect: number, near: number, far: number) {
            if (this._SIZE != 16) {
                console.log("Wrong dimensions");
                return;
            }
            var raw: Float32Array = this._raw;

            var top = near * Math.tan(fovy * Math.PI / 360.0);
            var right = top * aspect;

            var rl = 2 * right;
            var tb = 2 * top;
            var fn = (far - near);
            raw[0] = (near * 2) / rl;
            raw[1] = 0;
            raw[2] = 0;
            raw[3] = 0;
            raw[4] = 0;
            raw[5] = (near * 2) / tb;
            raw[6] = 0;
            raw[7] = 0;
            raw[8] = 0;
            raw[9] = 0;
            raw[10] = -(far + near) / fn;
            raw[11] = -1;
            raw[12] = 0;
            raw[13] = 0;
            raw[14] = -(far * near * 2) / fn;
            raw[15] = 0;
        }

        public m4rotate3d(angle: number, axis: number[]) {
            if (this._SIZE != 16 || axis.length != 3) {
                console.log("Wrong dimensions");
                return;
            }
            var raw: Float32Array = this._raw;
            var x = axis[0], y = axis[1], z = axis[2];
            var len = Math.sqrt(x * x + y * y + z * z);
            if (!len) { return; }
            if (len != 1) {
                len = 1 / len;
                x *= len;
                y *= len;
                z *= len;
            }

            var s = Math.sin(angle * Math.PI / 180);
            var c = Math.cos(angle * Math.PI / 180);
            var t = 1 - c;

            var a00 = raw[0], a01 = raw[1], a02 = raw[2], a03 = raw[3];
            var a10 = raw[4], a11 = raw[5], a12 = raw[6], a13 = raw[7];
            var a20 = raw[8], a21 = raw[9], a22 = raw[10], a23 = raw[11];

            var b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
            var b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
            var b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;

            // Perform rotation-specific matrix multiplication
            raw[0] = a00 * b00 + a10 * b01 + a20 * b02;
            raw[1] = a01 * b00 + a11 * b01 + a21 * b02;
            raw[2] = a02 * b00 + a12 * b01 + a22 * b02;
            raw[3] = a03 * b00 + a13 * b01 + a23 * b02;

            raw[4] = a00 * b10 + a10 * b11 + a20 * b12;
            raw[5] = a01 * b10 + a11 * b11 + a21 * b12;
            raw[6] = a02 * b10 + a12 * b11 + a22 * b12;
            raw[7] = a03 * b10 + a13 * b11 + a23 * b12;

            raw[8] = a00 * b20 + a10 * b21 + a20 * b22;
            raw[9] = a01 * b20 + a11 * b21 + a21 * b22;
            raw[10] = a02 * b20 + a12 * b21 + a22 * b22;
            raw[11] = a03 * b20 + a13 * b21 + a23 * b22;
        }

        public clone(): mat {
            var m = new mat(Math.sqrt(this._SIZE));
            m.set(this._raw);
            return m;
        }

        public translate(...tl: number[]) {
            if (Math.sqrt(this._SIZE) != (tl.length + 1)) {
                console.log("Wrong dimensions");
                return;
            }
            var mat: Float32Array = this._raw;

            for (var l = 0; l <= tl.length; l++) {
                for (var i = 0; i < tl.length; i++) {
                    mat[this._SIZE - (tl.length + 1) + l] += tl[i] * mat[i * (tl.length + 1) + l];
                }
            }
        }

        public set(mat) {
            if (mat.length != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] = mat[i];
            }
        }
        public add(mat: mat) {
            if (mat.SIZE != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = mat.raw;
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] += v[i];
            }
        }
        public sub(mat: mat) {
            if (mat.SIZE != this._SIZE) {
                console.log("Wrong dimensions");
                return;
            }
            var v: Float32Array = mat.raw;
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] -= v[i];
            }
        }
        public scale(val: number) {
            for (var i = 0; i < this._SIZE; i++) {
                this._raw[i] *= val;
            }
        }
    }
}
