let stopped = true
const start = function () {
    function createElements() {
        document.getElementById("container").style.height = "100px"
        document.getElementById("toggle").innerText = "Pause"
        const canvas = document.createElement('canvas')
        canvas.id = "mycanvas"
        document.body.appendChild(canvas)
        const audioElement = document.createElement('audio')
        audioElement.id = "myaudio"
        document.body.appendChild(audioElement)
        return {canvas, audioElement}
    }

    function setupCanvas(canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        const audioCtx = new AudioContext()
        const analyser = audioCtx.createAnalyser()
        let power = 1
        while (power < window.innerWidth * 2)
            power <<= 1
        analyser.fftSize = power
        return {ctx, audioCtx, analyser}
    }

    function createAudioVisualizer() {
        stopped = false
        const {canvas, audioElement} = createElements()
        const {ctx, audioCtx, analyser} = setupCanvas(canvas)
        const player = audioCtx.createMediaElementSource(audioElement)
        player.connect(audioCtx.destination)
        player.connect(analyser)
        audioElement.src = 'fade.wav'
        audioElement.play()
        const results = new Uint8Array(analyser.frequencyBinCount)
        let x = 0
        let forwards = true
        draw = function () {
            window.requestAnimationFrame(draw)

            function createGradient() {
                let grd = ctx.createLinearGradient(0, 0, canvas.width, 0)
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                grd.addColorStop(0, 'red')
                grd.addColorStop(1 / 6, 'orange')
                grd.addColorStop(2 / 6, 'yellow')
                grd.addColorStop(3 / 6, 'green')
                grd.addColorStop(4 / 6, 'aqua')
                grd.addColorStop(5 / 6, 'blue')
                grd.addColorStop(1, 'purple')
                ctx.fillStyle = grd
            }

            createGradient()
            analyser.getByteFrequencyData(results)
            for (let i = 0; i < analyser.frequencyBinCount; i++) {
                ctx.fillRect(i, canvas.height, 1, results[i] * 3 * -1) // upside down
            }

            function createTriangle(y) {
                if (x >= canvas.width)
                    forwards = false
                if (x <= 0)
                    forwards = true
                if (forwards) {
                    ctx.beginPath()
                    ctx.moveTo(50 + x * 1.5, y)
                    ctx.lineTo((50 + x) * 1.5, y * 2.5)
                    ctx.lineTo(150 + x, y * 2.5 * -1.5)
                    x += 5
                    ctx.closePath()
                    ctx.fill()
                } else {
                    x -= 5
                    ctx.moveTo(50 + x * 1.5, y)
                    ctx.lineTo((50 + x) * 1.5, y * 2.5)
                    ctx.lineTo(150 + x, y * 2.5 * -1.5)
                    ctx.closePath()
                    ctx.fill()
                }
            }

            createTriangle(50)
            //createTriangle(250)

        }
        draw()
    }

    if (stopped) {
        createAudioVisualizer()
    } else {
        document.getElementById("container").style.height = "100vh"
        document.getElementById("toggle").innerText = "Play"
        document.getElementById("mycanvas").remove()
        document.getElementById("myaudio").remove()
        stopped = true
    }
}

window.onload = () => document.querySelector('button').onclick = start