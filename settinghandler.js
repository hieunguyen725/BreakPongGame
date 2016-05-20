$(function() {
	$("#ball_slider_label").text( "Current ball speed: " + BALL_SPEED);
	$("#paddle_slider_label").text( "Current paddle speed: " + PADDLE_SPEED);
	$("#brick_slider_label").text( "Current bricks speed: " + BRICK_SPEED);
});
                    
$("#ball_speed_slider").slider({ 
    min: 5, 
    max: 15,
    value: BALL_SPEED,
    step: 0.1
})
.slider("float", {
    rest: "label"
})
.on("slide", function(e,ui) {
	console.log(ui.value);
	BALL_SPEED = ui.value;
	$("#ball_slider_label").text( "Current ball speed: " + BALL_SPEED);
});

$("#paddle_speed_slider").slider({ 
    min: 5, 
    max: 15,
    value: PADDLE_SPEED,
    step: 0.1
})
.slider("float", {
    rest: "label"
})
.on("slide", function(e,ui) {
	console.log(ui.value);
	PADDLE_SPEED = ui.value;
	$("#paddle_slider_label").text( "Current paddle speed: " + PADDLE_SPEED);
});

$("#brick_speed_slider").slider({ 
    min: 0, 
    max: 10,
    value: BRICK_SPEED,
    step: 0.1
})
.slider("float", {
    rest: "label"
})
.on("slide", function(e,ui) {
	console.log(ui.value);
	BRICK_SPEED = ui.value;
	$("#brick_slider_label").text( "Current bricks speed: " + BRICK_SPEED);
});

function radioChange(currentRadio) {
	console.log(currentRadio.value);
	if (currentRadio.value == 1) {
		ONLY_AI = true;
	} else {
		ONLY_AI = false;
	}
}