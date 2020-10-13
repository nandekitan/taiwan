
+function ($) { // global guard

	'use strict'

	$(function () { // ready

		// prepare map
		google.maps.visualRefresh = true
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 10,
			center: new google.maps.LatLng(38, 137.329102),
		})

		// load miumius asynchronously
		$.getJSON('みうみうなんで行っ台湾.json', spreadMius)

		// scroll to your position
		$('#current').click(function () {
			navigator.geolocation.getCurrentPosition(function (position) {
				var p = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
				map.setCenter(p)
			}, null, {
				enableHighAccuracy: true,
			})
		})

		// a lot of miumiu found
		function spreadMius(data) {

			var faceFace = {
				url: 'みうみうなんで行っ台湾.png',
				scaledSize: new google.maps.Size(19 * 1.5, 27.6 * 1.5),
			}

			var window = new google.maps.InfoWindow()
			var template = $('#template').html()
			Mustache.parse(template)

			// map literal to LatLng
			var points = $.map(data.tweets, function (p) { return new google.maps.LatLng(p.lat, p.long) })

			// trace position
			var path = new google.maps.Polyline({
				path: points,
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2,
				map: map,
			})

			// wrap heatmap layer
			var heatmap = new google.maps.visualization.HeatmapLayer({
				data: new google.maps.MVCArray(points),
				opacity: 0.8,
				map: map,
			})

			// scroll to current miu
			map.setCenter(points[0])
			map.setZoom(14)

			// group by position
			var groups = data.tweets.reduce(function (_, e) {
				if (_.length && _[_.length - 1].lat == e.lat && _[_.length - 1].long == e.long) {
					_[_.length - 1].tweets.push(e)
				} else {
					_.push({
						lat: e.lat,
						long: e.long,
						tweets: [ e ],
					})
				}
				return _
			}, [])

			var activeMarker = null

			// plot markers
			var markers = groups.reduce(function (_, g, index) {

				var p = new google.maps.LatLng(g.lat, g.long)
				var marker = new google.maps.Marker({
					position: p,
					map: map,
					icon: faceFace,
					title: 'み',
					clickable: true,
				})

				google.maps.event.addListener(marker, 'click', function () {

					if (activeMarker != this) {
						if (activeMarker) {
							activeMarker.setAnimation(null)
						}
						activeMarker = this
						activeMarker.setAnimation(google.maps.Animation.BOUNCE)
					}

					window.close()
					window.setContent(Mustache.render(template, {
						tweets: g.tweets,
						hasNext: index > 0,
						hasPrev: index < groups.length - 1,
						next: index - 1,
						prev: index + 1,
					}))
					window.open(map, this)

				})

				_.push(marker)

				return _

			}, [])

			// register miu handler
			$('#miu').click(function () {
				map.setCenter(points[0])
				google.maps.event.trigger(markers[0], 'click')
			}).show()

			// register hidden commands
			konami(konamiumiu)

			// preloading fraguments for konamiumiu
			$('<img />').attr('src', 'コナみうみうなんで行っ台湾.png')
			$('<img />').attr('src', 'みうみうなんで行っ台湾.gif')

			// define routing & start application
			Sammy(function () {

				this.get('#:entry', function() {
					google.maps.event.trigger(markers[this.params.entry], 'click')
				})

			}).run('#0')

		}

	})

	// split the world into fragments
	function sliceTheWorld() {

		var factor = 4 // 64 x 64

		$('img[style*="256px"]:visible').each(function () {
			var e = $(this)

			var w = Math.ceil(e.outerWidth() / factor)
			var h = Math.ceil(e.outerHeight() / factor)
			var base = e.offset()

			for (var y = 0; y < factor; ++y) {
				var t = base.top + h * y

				for (var x = 0; x < factor; ++x) {
					var l = base.left + w * x

					e
						// clone element
						.clone()
						.css({ position: 'absolute', visibility: 'visible', left: -x * w, top: -y * h })
						.appendTo('body')

						// wrap with crop window (cripping region)
						.wrap('<div />')
						.parent()
						.css({ position: 'absolute', overflow: 'hidden', width: w, height: h, left: l, top: t})
						.addClass('another-world')

				}
			}

		})
		// relax, We save the real world
		.addClass('real-world')
		.hide()

		return $('.another-world')
	}

	function restoreWorld() {
		$('.real-world').removeClass('real-world').show()
		$('.another-world').remove()
	}

	// NEVER READ *unko na miumiu*
	function unkonamiumiu() {
		restoreWorld()
		$('.konamiumiu').remove()
		$('#miu').show()
		$('body').css('background', 'inherit')
		$('#map').show()
	}

	/*
		Following code is based on Ben Olson's
		Javascript Physics - Creating an Explosion Effect
		http://bseth99.github.io/projects/animate/A-tweenlite-exploding-effect.html

		Copyright (c) 2012 Ben Olson

		Released under the MIT license
		http://opensource.org/licenses/mit-license.php

		Arranged by (c) 2014 Hiroyuki Ushito
	*/

	// explode miumiu to crash the world
	function konamiumiu() {

		var world = sliceTheWorld()
		var timeline = createDestructionTimeline(world)

		var total = timeline.totalDuration()

		// 90% of what happens will occur at the very beginning of the animations
		// However, the boxes closest to the origin of the wave will fly off the
		// screen at such a high velocity that they will likely take 700 seconds
		// to come to a complete stop. I'll use exponential scaling of the animation
		// so to give us the "good part" that can be stepped through and tracked
		// with the progress bar.

		var scaled = Math.log(total) * 10;

		// show galaxy
		$('#map').hide()
		$('body').css('background', '#050505  url(みうみうなんで行っ台湾.gif) fixed')

		// add chance to save the world!
		command(unkonamiumiu, [38, 38, 40, 40, 76, 82, 76, 82, 66, 65])

		// redraw & go
		window.setTimeout(function () {

			// explode miumiu
			var offset = $('#miu').offset()
			$('<img />')
					.attr('src', 'コナみうみうなんで行っ台湾.png')
					.addClass('konamiumiu')
					.appendTo('body')
					.css({
						position: 'fixed',
						visibility: 'visible',
						opacity: 0.5,
						left: offset.left,
						top: offset.top,
						width: 105 * 0.7,
						height: 46 * 0.7
					})
					.animate({ opacity: 1 }, 3000)
			$('#miu').hide()

			// boom!
			$('#konamiumiu').get(0).play()
/*
			$('.konamiumiu').each(function () {
				$(this).animate({ opacity: 1 - Math.random() / 4 }, 5000)
			})
*/
			timeline.duration(total)
			timeline.resume()

		}, 0)

	}

	// lord of the easteregg
	function konami(callback) {
		command(callback, [38, 38, 40, 40, 37, 39, 37, 39, 66, 65])
	}

	function command(callback, command) {

		var queue = command.concat()

		$(document)
			.on('keydown.command', function (e) {
				if (queue.shift() != e.keyCode) {
					queue = command.concat()
					return;
				}
				if (queue.length == 0) {
					// queue = command.concat()
					$(document).off('keydown.command')
					callback()
					return;
				}
			})

	}

	// core explosion effect
	function createDestructionTimeline(world) {

		var timeline = new TimelineLite({ paused: true })

		var offset = $('#miu').offset()
		var r = { x: offset.left, y: offset.top}

		var cof = 9 // 1: Deacceleration (px/ms^2)
		var pin = 150000 // 200: Pulse intensity - force (m*px/ms^2)
		var psd = 3000 // 100: Pulse speed (px/ms)
		var now = 0 // Current time

		world.each(function () {

			var e = $(this)

			var off = e.position()
			var ct = { x: e.width() / 2 + off.left, y: e.height() / 2 + off.top}

			var area = e.width() * e.height()
			var surf = 10 * (e.width() + e.height())
			var mass = area / 100
			var rot = (Math.random() * 5 - 2.5)

			var o = {
				area: 0, mass: 0, surf:0,
				dx: 0, dy: 0, dr: 0,
				sst: 0, mmt: 0, eet: 0,
				osd: 0, md: 0, td: 0,
				mx: 0, my: 0, fx: 0, fy: 0,
				rota: 0, rotb: 0
			}

			// Need to know at which point in time the
			// wave will hit the box. Although not perfect,
			// use the distance from center of the box shape
			// to r. Do some triangle math to find the hypotenuse
			// and then find the start time by dividing the distance
			// by the speed of the wave.

			o.dx = ct.x - r.x
			o.dy = ct.y - r.y
			o.dr = Math.sqrt(o.dx * o.dx + o.dy * o.dy)
			o.sst = o.dr / psd

			o.area = area
			o.surf = surf
			o.mass = mass

			// Now figure out the maximum speed of the object.
			// This is based on the amount of enery remaining in the
			// the wave at dr, how long the wave is in contact with the
			// box, and how heavy the box is.

			o.osd = (pin * 1000 / (o.dr * o.dr)) * (o.surf / psd) / o.mass

			// Now that we know how fast the box will be moving, we
			// can solve for how long it will to each part of the
			// speeding up and slowing down. There's a few intermediate
			// variables.

			// The important ones are the **t (time) and *x/*y (distance deltas)

			o.mmt = o.sst + (o.surf / psd)
			o.md = (o.mmt - o.sst) * o.osd

			o.mx = o.dx * o.md / o.dr
			o.my = o.dy * o.md / o.dr

			o.eet = o.mmt + o.osd / cof
			o.td = (o.eet - o.mmt) * o.osd

			o.fx = o.mx + o.dx * o.td / o.dr
			o.fy = o.my + o.dy * o.td / o.dr

			// Assign a random rotational velocity to each shape
			// Use the distance traveled as a scaling metric.

			o.rota = Math.round(rot * o.md)
			o.rotb = Math.round(o.rota + rot * o.td)

			// The easing function will take care of
			// acceleration/deacceleration. We just
			// need to know how long and how far.
			// TweenLite does the rest.

			timeline.insertMultiple([
				TweenLite.to(this, (o.mmt - o.sst), {
					ease: Power2.easeIn,
					css: {
							top: off.top + o.my,
							left: off.left + o.mx,
							rotation: o.rota + 'deg'
						}
					}
				),

				TweenLite.to(this, (o.eet - o.mmt), {
					ease: Power2.easeOut,
					css: {
						top: off.top + o.fy,
						left: off.left + o.fx,
						rotation: o.rotb + 'deg'
					}
				})

			], o.sst, 'sequence', 0)

		})

		return timeline

	}

}(jQuery)
