function isPlayable() {
    return localStorage.getItem("playing") == "true";
}

function setPlaying(playing = "true") {
    localStorage.setItem("playing", playing);
}
let paused = true,
    loop = false;
let audio = null;
$(document).ready(() => {
    console.log(isPlayable());
    if ( isPlayable() )
    {
        audio = new Audio("assets/bgAudio.mp3");
        audio.volume = 0.5;
        audio.addEventListener("canplaythrough", async (event) => {
            try {
                /* the audio is now playable; play it if permissions allow */
                audio.loop = true;
                await audio.play();
                $(".audio i").removeClass("fa-play");
                $(".audio i").addClass("fa-pause");
            } catch ( e )
            {
                $(".audio").attr("id", "pause");
                $(".audio i").removeClass("fa-pause");
                $(".audio i").addClass("fa-play");
            }
        });
        audio.addEventListener("ended", (event) => {
            // restart the audio
            audio.currentTime = 0;
            audio.play();
        });
    } else {
        $("#play").attr("id", "pause");
        $("#pause i").removeClass("fa-pause");
        $("#pause i").addClass("fa-play");
    }

    $(".audio").click(() => {
        if ($(".audio").attr("id") == "play") {
            audio.pause();
            paused = true;
            $(".audio").attr("id", "pause");

            $("#pause i").removeClass("fa-pause");
            $("#pause i").addClass("fa-play");
            setPlaying(false);
        } else
        {
            if ( !audio )
            {
                audio = new Audio( "assets/bgAudio.mp3" );
                audio.volume = 0.5;
            }
            if (paused) {
                audio.play();
                paused = false;
            }
            if (!loop) {
                audio.loop = true;
                loop = true;
            }
            $(".audio").attr("id", "play");
            $(".audio i").removeClass("fa-play");
            $(".audio i").addClass("fa-pause");
            setPlaying(true);
        }
    });
});
