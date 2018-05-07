const Alexa = require("ask-sdk");

const audioEventHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === "AudioPlayer.PlaybackStopped"
      || handlerInput.requestEnvelope.request.type === "AudioPlayer.PlaybackStarted"
      || handlerInput.requestEnvelope.request.type === "AudioPlayer.PlaybackFinished"
      || handlerInput.requestEnvelope.request.type === "AudioPlayer.PlaybackNearlyFinished"
      || handlerInput.requestEnvelope.request.type === "AudioPlayer.PlaybackFailed");
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
}

const MetronomeIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "MetronomeIntent"
    );
  },
  handle(handlerInput) {
    const bpm = handlerInput.requestEnvelope.request.intent.slots.bpm.value;
    const speechText = `You asked to start a metronome at ${bpm} beats per minute`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("Hello World", speechText)
      .addAudioPlayerPlayDirective('REPLACE_ALL', 'https://s3.eu-west-2.amazonaws.com/beat-files/110-4_4.mp3', 'abc', 0, undefined)
      .getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Welcome to the Alexa Skills Kit, you can say hello!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Hello World", speechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "You can say hello to me!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Hello World", speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("Hello World", speechText)
      .getResponse();
  }
};

function getOffsetInMilliseconds() {
  // Extracting offsetInMilliseconds received in the request.
  return this.event.request.offsetInMilliseconds;
}

const PauseIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  }
}

const ResumeIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
    )
  },
  handle(handlerInput) {
    const offset = handlerInput.requestEnvelope.context.AudioPlayer.offsetInMilliseconds;
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', 'https://s3.eu-west-2.amazonaws.com/beat-files/110-4_4.mp3', 'abc', offset, undefined)
      .getResponse()
  }
}
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};

let skill;

async function mainHandler(event, context) {
  console.log(`REQUEST++++${JSON.stringify(event, null, 2)}`);
  
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        MetronomeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        audioEventHandler,
        PauseIntentHandler,
        ResumeIntentHandler
      )
      .create();
  }

  return skill.invoke(event, context);
}

exports.handler = mainHandler;
