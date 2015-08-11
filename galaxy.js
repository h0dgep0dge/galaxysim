var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var galaxySim;
(function (galaxySim) {
    var vector2d = (function () {
        function vector2d(x, y) {
            this.x = x;
            this.y = y;
        }
        vector2d.sum = function (a, b) { return new vector2d(a.x + b.x, a.y + b.y); };
        vector2d.times = function (m, v) { return new vector2d(v.x * m, v.y * m); };
        vector2d.div = function (v, d) { return new vector2d(v.x / d, v.y / d); };
        vector2d.mag = function (v) { return Math.sqrt(v.x * v.x + v.y * v.y); };
        vector2d.norm = function (v) {
            var mag = vector2d.mag(v);
            var div = (mag === 0) ? Infinity : 1.0 / mag;
            return vector2d.times(div, v);
        };
        return vector2d;
    })();
    galaxySim.vector2d = vector2d;
    var coords2d = (function (_super) {
        __extends(coords2d, _super);
        function coords2d() {
            _super.apply(this, arguments);
        }
        coords2d.difference = function (a, b) {
            return new vector2d(b.x - a.x, b.y - a.y);
        };
        return coords2d;
    })(vector2d);
    galaxySim.coords2d = coords2d;
    var SVGDrawer = (function () {
        function SVGDrawer(target) {
            this.target = target;
        }
        SVGDrawer.prototype.clear = function () {
            while (this.target.firstChild)
                this.target.removeChild(this.target.firstChild);
        };
        SVGDrawer.prototype.circle = function (center, radius, colour) {
            var elm = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            elm.setAttributeNS(null, 'cx', center.x.toString());
            elm.setAttributeNS(null, 'cy', center.y.toString());
            elm.setAttributeNS(null, 'r', radius.toString());
            elm.setAttributeNS(null, 'stroke-width', '0');
            elm.setAttributeNS(null, 'fill', colour);
            this.target.appendChild(elm);
        };
        SVGDrawer.prototype.line = function (endpoints, weight, colour) {
            var elm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            elm.setAttributeNS(null, 'x1', endpoints[0].x.toString());
            elm.setAttributeNS(null, 'y1', endpoints[0].y.toString());
            elm.setAttributeNS(null, 'x2', endpoints[1].x.toString());
            elm.setAttributeNS(null, 'y2', endpoints[1].y.toString());
            elm.setAttributeNS(null, 'stroke-width', weight.toString());
            elm.setAttributeNS(null, 'stroke', colour);
            this.target.appendChild(elm);
        };
        return SVGDrawer;
    })();
    galaxySim.SVGDrawer = SVGDrawer;
    var scaledDrawer = (function () {
        function scaledDrawer(parent, scale) {
            this.parent = parent;
            this.scale = scale;
        }
        scaledDrawer.prototype.circle = function (center, radius, colour) {
            this.parent.circle(vector2d.div(center, this.scale), radius / this.scale, colour);
        };
        scaledDrawer.prototype.line = function (endpoints, weight, colour) {
            this.parent.line([vector2d.div(endpoints[0], this.scale), vector2d.div(endpoints[1], this.scale)], weight, colour);
        };
        scaledDrawer.prototype.clear = function () { this.parent.clear(); };
        return scaledDrawer;
    })();
    galaxySim.scaledDrawer = scaledDrawer;
    var offsetDrawer = (function () {
        function offsetDrawer(parent, offset) {
            this.parent = parent;
            this.offset = offset;
        }
        offsetDrawer.prototype.circle = function (center, radius, colour) {
            this.parent.circle(vector2d.sum(center, this.offset), radius, colour);
        };
        offsetDrawer.prototype.line = function (endpoints, weight, colour) {
            this.parent.line([vector2d.sum(endpoints[0], this.offset), vector2d.sum(endpoints[1], this.offset)], weight, colour);
        };
        offsetDrawer.prototype.setOffset = function (offset) {
            this.offset = offset;
        };
        offsetDrawer.prototype.clear = function () { this.parent.clear(); };
        return offsetDrawer;
    })();
    galaxySim.offsetDrawer = offsetDrawer;
    var pointObj = (function () {
        function pointObj() {
        }
        pointObj.prototype.getLoc = function () {
            return new coords2d(0, 0);
        };
        pointObj.prototype.draw = function (out) {
            out.circle(this.getLoc(), this.getRadius(), 'black');
        };
        pointObj.prototype.accelerate = function (force, time) { };
        pointObj.prototype.getVelocity = function () { return new vector2d(0, 0); };
        pointObj.prototype.getMass = function () { return 0; };
        pointObj.prototype.getRadius = function () { return 5; };
        ;
        return pointObj;
    })();
    galaxySim.pointObj = pointObj;
    var simplePoint = (function (_super) {
        __extends(simplePoint, _super);
        function simplePoint(loc) {
            _super.call(this);
            this.loc = loc;
        }
        simplePoint.prototype.getLoc = function () {
            return this.loc;
        };
        simplePoint.prototype.move = function (loc) {
            this.loc = loc;
        };
        return simplePoint;
    })(pointObj);
    galaxySim.simplePoint = simplePoint;
    var movingPoint = (function (_super) {
        __extends(movingPoint, _super);
        function movingPoint(loc, velocity) {
            _super.call(this);
            this.loc = loc;
            this.velocity = velocity;
        }
        movingPoint.prototype.step = function (time) {
            this.loc = vector2d.sum(this.loc, vector2d.times(time, this.velocity));
        };
        movingPoint.prototype.getLoc = function () {
            return this.loc;
        };
        movingPoint.prototype.getVelocity = function () { return this.velocity; };
        return movingPoint;
    })(pointObj);
    galaxySim.movingPoint = movingPoint;
    var weightedPoint = (function (_super) {
        __extends(weightedPoint, _super);
        function weightedPoint(loc, velocity, mass) {
            _super.call(this, loc, velocity);
            this.mass = mass;
        }
        weightedPoint.prototype.accelerate = function (force, time) {
            this.velocity = vector2d.sum(this.velocity, vector2d.times(time, galaxySim.vector2d.div(force, this.mass)));
        };
        weightedPoint.prototype.getMass = function () {
            return this.mass;
        };
        return weightedPoint;
    })(movingPoint);
    galaxySim.weightedPoint = weightedPoint;
    var planet = (function (_super) {
        __extends(planet, _super);
        function planet(loc, velocity, mass, raduis) {
            _super.call(this, loc, velocity, mass);
            this.raduis = raduis;
        }
        planet.prototype.getRadius = function () { return this.raduis; };
        return planet;
    })(weightedPoint);
    galaxySim.planet = planet;
    var controller = (function () {
        function controller() {
            this.steppers = [];
            this.drawers = [];
        }
        controller.prototype.step = function (time) {
            for (var i = 0; i < this.steppers.length; i++)
                this.steppers[i].step(time);
        };
        controller.prototype.draw = function (out) {
            for (var i = 0; i < this.drawers.length; i++)
                this.drawers[i].draw(out);
        };
        controller.prototype.addStepper = function (s) { this.steppers.push(s); };
        controller.prototype.addDrawer = function (d) { this.drawers.push(d); };
        controller.prototype.addStepperList = function (s) { for (var i = 0; i < s.length; i++)
            this.steppers.push(s[i]); };
        controller.prototype.addDrawerList = function (d) { for (var i = 0; i < d.length; i++)
            this.drawers.push(d[i]); };
        return controller;
    })();
    galaxySim.controller = controller;
    var gravity = (function () {
        function gravity(gravitationalConstant) {
            this.gravitationalConstant = gravitationalConstant;
            this.objs = [];
        }
        gravity.prototype.gravitate = function (s) { this.objs.push(s); };
        gravity.prototype.gravitateList = function (s) { for (var i = 0; i < s.length; i++)
            this.gravitate(s[i]); };
        gravity.prototype.step = function (time) {
            for (var a = 0; a < this.objs.length; a++)
                for (var b = a + 1; b < this.objs.length; b++) {
                    var massProduct = this.objs[a].getMass() * this.objs[b].getMass();
                    var diff = coords2d.difference(this.objs[a].getLoc(), this.objs[b].getLoc());
                    var r = vector2d.mag(diff);
                    var norm = coords2d.norm(diff);
                    var f = this.gravitationalConstant * (massProduct / (r * r));
                    this.objs[a].accelerate(vector2d.times(f, norm), time);
                    this.objs[b].accelerate(vector2d.times(-f, norm), time);
                }
        };
        return gravity;
    })();
    galaxySim.gravity = gravity;
    var drag = (function () {
        function drag(frictionalConstant) {
            this.frictionalConstant = frictionalConstant;
            this.objs = [];
        }
        drag.prototype.drag = function (s) { this.objs.push(s); };
        drag.prototype.dragList = function (s) { for (var i = 0; i < s.length; i++)
            this.drag(s[i]); };
        drag.prototype.step = function (time) {
            for (var a = 0; a < this.objs.length; a++) {
                var f = vector2d.times(-this.frictionalConstant, this.objs[a].getVelocity());
                this.objs[a].accelerate(f, time);
            }
        };
        return drag;
    })();
    galaxySim.drag = drag;
})(galaxySim || (galaxySim = {}));
