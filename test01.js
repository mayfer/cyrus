
var extend = function(dest, from) {
    var props = Object.getOwnPropertyNames(from);
    props.forEach(function(name) {
        if (name in dest) {
            var destination = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(dest, name, destination);
        }
    });
    return dest;
};

var Logo = function(elem, options) {
    var lg = this;

    lg.canvas = Canvas(elem);
    lg.ctx = lg.canvas.getContext("2d");

    var ctx = lg.ctx; // shortcut

    if(options === undefined) { options = {}; }
    lg.options = extend({
        resizeWithWindow: true,
    }, options);

    lg.hover = function(percent) {
    };

    lg.reset = function() {
        ctx.clearRect(0, 0, ctx.width, ctx.height);
    };
    
    lg.render = function() {
        lg.reset();
        ctx.fillStyle = '#fff';

        for(var name in lg.particles) {
            var particle = lg.particles[name];
            ctx.beginPath();
            ctx.arc(particle.center.x, particle.center.y, particle.radius, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    };

    lg.bounce = function(particle) {
        particle.direction.x = -particle.direction.x;
    }

    lg.emit_photon = function(center, direction) {
        var photon = new lg.particle(center, direction, 3);
        
        lg.particles.c = photon;
    }

    lg.animate = function() {

        lg.iter += 1;

        for(var name in lg.particles) {
            var particle = lg.particles[name];
            particle.center.x += particle.direction.x;
            particle.center.y += particle.direction.y;

            if(particle.center.y > ctx.height) {
                lg.resize();
            }

        }

        var a = lg.particles.a;
        var b = lg.particles.b;
        var c = lg.particles.c;
        
        if(lg.distance(a.center, b.center) <= 100) {
            lg.bounce(a);
            lg.bounce(b);

            var direction = {x: 5, y: 3};
            lg.emit_photon(a.center, direction);
        }

        if(c && lg.distance(b.center, c.center) <= 4) {
            delete lg.particles.c;
        }

        window.requestAnimationFrame(function() {
            lg.render();
            if(lg.animating == true) {
                lg.animate();
            }
        });
    };

    lg.particle = function(center, direction, radius) {
        this.center = {
            x: center.x,
            y: center.y,
        };
        this.original_center = {
            x: center.x,
            y: center.y,
        };
        this.direction = {
            x: direction.x,
            y: direction.y,
        };
        this.radius = radius;
    };

    lg.resize = function() {
        lg.particles = {}

        var size = 5;
        lg.particles.a = new lg.particle({x: 0, y: 0}, {x: 1, y: 2}, size);
        lg.particles.b = new lg.particle({x: 200, y: 0}, {x: -1, y: 2}, size);

    };

    lg.distance = function(pos1, pos2) {
        var diff = {
            x: (pos1.x - pos2.x),
            y: (pos1.y - pos2.y),
        }

        return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
    }


    lg.init = function() {

        lg.resize();
        lg.reset();

        var getCoordinates = function(that, e) {
            if(e && e.changedTouches && e.changedTouches[0]) {
                e = e.changedTouches[0];
            }

            var rect = that.getBoundingClientRect()
            var parentOffset = {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            }

            var x = e.pageX - parentOffset.left;
            var y = e.pageY - parentOffset.top;

            return {x: x, y: y};
        }

        var clickOrTap = function(e) {
            var pos = getCoordinates(this, e);
        };

        var hoverOrTouchMove = function(e) {
            var pos = getCoordinates(this, e);
            //lg.disrupt(pos);
            //lg.animating = false;
        };

        var mouseout = function(e){
        };

        elem.addEventListener('click', clickOrTap);
        elem.addEventListener('touchstart', hoverOrTouchMove);
        elem.addEventListener('mousemove', hoverOrTouchMove);
        elem.addEventListener('mouseout', mouseout);
        elem.addEventListener('touchend', mouseout);

        if(lg.options.resizeWithWindow === true) {
            var resizeHandler;
            window.addEventListener('resize', function(e){
                clearTimeout(resizeHandler);
                resizeHandler = setTimeout(function() {
                    setCanvasSize(lg.canvas, elem.offsetWidth, lg.canvas.offsetHeight);
                    lg.resize();
                }, 300);
            });
        }

        lg.iter = 0;
        lg.animating = true;
        lg.animate(lg.iter);
    };

    lg.init();
};
