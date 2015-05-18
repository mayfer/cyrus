
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

    lg.wave = function(freq, amplitude) {
        var wave = this;
        wave.freq = freq;
        wave.phase = 0;
        if(amplitude) {
            wave.amplitude = amplitude;
        } else {
            wave.amplitude = 6;
        }
        wave.iter = Math.random() * Math.PI * 2;
    }
    
    lg.render = function() {
        lg.reset();
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 3;

        ctx.beginPath();

        var center = {
            x: ctx.width/2,
            y: ctx.height/2,
        };
        var radius = 50;

        var pos = {
            x: center.x + radius,
            y: center.y,
        }
        //ctx.lineTo(pos.x, pos.y);
        ctx.arc(center.x, center.y, radius, Math.PI*0, Math.PI * 2, false);
        //ctx.stroke();
        ctx.stroke();
        ctx.closePath();

        for(var x = 0; x <= radius*2; x+=1) {
            var val = 0;
            for(var i=0; i<lg.waves.length; i++) {
                var wave = lg.waves[i];
                val += Math.sin(wave.iter) * Math.sin( (x / (radius*2)) * Math.PI * 2 * (wave.freq / 220)) * wave.amplitude;
                wave.iter += wave.freq/2200000;
            }

            var multiplier = Math.sin((x / (radius*2)) * Math.PI);
            val *= multiplier;

            //ctx.lineTo(pos.x - x, pos.y + val);
            ctx.beginPath();
            ctx.arc(pos.x - x, pos.y + val*3, 1.5, Math.PI*0, Math.PI * 2, false);
            ctx.fill();
        }
    };
    lg.animate = function() {

        lg.iter += 0.1;

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
        var base_freq = 220;
        lg.waves = [];
        for(var i=0; i<5; i++) {
            var wave = new lg.wave(base_freq * i);
            lg.waves.push(wave);
        }

        // var wave = new lg.wave(5500, 3); lg.waves.push(wave);
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
