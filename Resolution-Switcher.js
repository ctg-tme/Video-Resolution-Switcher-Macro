/********************************************************
Copyright (c) 2025 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
/**
 * Author(s)                Robert(Bobby) McGonigle Jr
 *                          Technical Marketing Engineering, Technical Leader
 *                          Cisco Systems
 * 
 * Description
 *  - Discovers and Generates a UserInterface to allow for changes to Video Input and Output Resolutions
*/

import xapi from 'xapi';

async function buildUI() {
  // Grab Input Configuration
  const availableInputs = await xapi.Config.Video.Input.Connector.get();

  // Object to place generated input row XML
  let inputRows = ``

  // Track current value per input for feedback update
  let currentInputSelection = {}

  // Loop through inputs
  for (let input of availableInputs) {
    // Filter out inputs without a Preferred Resolution config
    if (input?.PreferredResolution) {
      currentInputSelection[input.id] = input.PreferredResolution

      // Grab configurable values for this input
      const availableResolutions = (await xapi.doc(`Configuration Video Input Connector ${input.id} PreferredResolution`)).ValueSpace.Value;

      // Object to place generated input resolution selection XML
      let groupButton = '';

      // Loop through each resolution available
      availableResolutions.forEach(rezzo => {
        // Clean up Resolution name for UI
        const rezDetails = rezzo.split(`_`);
        const horizontal = rezDetails[0];
        const vertical = rezDetails[1];
        const frames = rezDetails[2];

        // Be sure to handle Auto, not needed, but good for potential future proofing
        const prettyName = rezzo == 'Auto' ? 'Auto' : `${horizontal}x${vertical}@${frames}`

        // Append XML for Group Button
        groupButton += `<Value> <Key>${rezzo}</Key> <Name>${prettyName}</Name> </Value>`
      })

      // Finalize Loop and append each row per input
      inputRows += `<Row>
        <Name>${input.Name} || Id: ${input.id}</Name>
        <Widget>
          <WidgetId>rezzy~Input~select~${input.id}</WidgetId>
          <Type>GroupButton</Type>
          <Options>size=4;columns=2</Options>
          <ValueSpace>
            ${groupButton}
          </ValueSpace>
        </Widget>
      </Row>`
    }
  }

  // Grab Ouput configuration
  const availableOutputs = await xapi.Config.Video.Output.Connector.get();

  // Object to place generated ouput row XML
  let outputRows = ``

  // Track current value per ouptut for feedback update
  let currentOutputSelection = {}

  // Loop through Outputs
  for (let output of availableOutputs) {

    // Not needed, but just in case, ensure Resolution config is available for output
    if (output?.Resolution) {
      currentOutputSelection[output.id] = output.Resolution

      // Grab configurable values for this output
      const availableResolutions = (await xapi.doc(`Configuration Video Output Connector ${output.id} Resolution`)).ValueSpace.Value;
      let groupButton = '';

      // Loop through each resolution available
      availableResolutions.forEach(rezzo => {
        // Clean up Resolution name for UI
        const rezDetails = rezzo.split(`_`);
        const horizontal = rezDetails[0];
        const vertical = rezDetails[1];
        const frames = rezDetails[2];

        // Be sure to handle Auto value
        const prettyName = rezzo == 'Auto' ? 'Auto' : `${horizontal}x${vertical}@${frames}`

        // Append XML for Group Button
        groupButton += `<Value> <Key>${rezzo}</Key> <Name>${prettyName}</Name> </Value>`
      })

      // Finalize Loop and append each row per ouptut
      outputRows += `<Row>
        <Name>Output ${output.id}</Name>
        <Widget>
          <WidgetId>rezzy~Output~select~${output.id}</WidgetId>
          <Type>GroupButton</Type>
          <Options>size=4;columns=2</Options>
          <ValueSpace>
            ${groupButton}
          </ValueSpace>
        </Widget>
      </Row>`
    }
  }

  // Assemble Final XML
  let fullXML = `<Extensions>
  <Panel>
    <Order>999</Order>
    <Origin>local</Origin>
    <Location>ControlPanel</Location>
    <Icon>Input</Icon>
    <Color>#D43B52</Color>
    <Name>Resolution Switcher</Name>
    <ActivityType>Custom</ActivityType>
    <Page>
      <Name>Input Resolution</Name>
      ${inputRows}
      <PageId>rezzy~Input</PageId>
      <Options>hideRowNames=0</Options>
    </Page>
    <Page>
      <Name>Output Resolution</Name>
      ${outputRows}
      <PageId>rezzy~Output</PageId>
      <Options>hideRowNames=0</Options>
    </Page>
  </Panel>
</Extensions>
`;

  // Save Panel
  await xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'rezzy' }, fullXML)

  // Parse and update Feedback to match the config
  const handleInputFeedbackIds = Object.keys(currentInputSelection);
  const handleOuptutFeedbackIds = Object.keys(currentOutputSelection);

  for (let input of handleInputFeedbackIds) {
    await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: `rezzy~Input~select~${input}`, Value: currentInputSelection[input] });
  }

  for (let output of handleOuptutFeedbackIds) {
    await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: `rezzy~Output~select~${output}`, Value: currentOutputSelection[output] });
  }

  console.log('UserInterface Built')
}

// Update UI on Video Input config changes
xapi.Config.Video.Input.Connector.on(async () => {
  await buildUI()
})

// Update UI on Video Output config changes
xapi.Config.Video.Output.Connector.on(async () => {
  await buildUI()
})

// Handle Widget Actions
xapi.Event.UserInterface.Extensions.Widget.Action.on(async ({ WidgetId, Value, Type }) => {
  if (Type == 'released' && WidgetId.includes('rezzy~')) {
    const [panel, page, action, id] = WidgetId.split(`~`);
    switch (page.toLowerCase()) {
      case 'input':
        if (action == 'select') {
          await xapi.Config.Video.Input.Connector[parseInt(id)].PreferredResolution.set(Value);
        }
        break;
      case 'output':
        if (action == 'select') {
          await xapi.Config.Video.Output.Connector[parseInt(id)].Resolution.set(Value);
        }
        break;
    }
    console.log(`Video ${page} set to ${Value}`)
  }
})

async function init() {
  await buildUI()
}

init();