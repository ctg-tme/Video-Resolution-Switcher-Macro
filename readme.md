# Video Resolution Switcher Macro

This macro generates a UI Extensions on the fly that enables changing of the Video Input and Output resolution

This solution was built primarily for testing different combinations of input and output resolutions so it's best not to roll out for general use throughout an organization, though some broadcasting use cases may benefit from this.

## Details

| Tested RoomOs Version  | Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:-----------------------|:------------|:--------------------------|:-----------|:-----------------------------------------|
| 26.1.1                 | ✅          | ✅                        | ✅          | ✅                                       |

### Tested Endpoints
- Room Bar Pro
- Codec EQ

### Recommended Use Cases
- Testing
    - For testing displays and laptops
- Broadcasting
    - To quickly adapt to changes in your setup
- Mobile Carts
    - For handling unknowns on a mobile setup, such as a variety of displays

### NOT RECOMMENDED FOR GENERAL USE
- Giving this level of access to general user could increase support escalations as a user may not know what is ideal for the hardware available in the space and what resolution to pick. Best for field support.

## Features
- Automatically Generates the User Interface

[![Location of Resolution Switcher UI in Control Panel](/images/home_screen_controlPanel.png)](#)


- Discovers available inputs available using [xConfiguration Video Input Connector[1] PreferredResolution](https://roomos.cisco.com/xapi/Configuration.Video.Input.Connector[1].PreferredResolution/) and render a row per input
    - Discovers the current values available to the input based on its PrefferedResolution configuration

[![Input Resolution Page](/images/input_selection.png)](#)

- Discovers available outputs available using [xConfiguration Video Output Connector[N] Resolution](https://roomos.cisco.com/xapi/Configuration.Video.Output.Connector[1..3].Resolution/) and render a row per output
    - Discovers the current values available to the output based on its Resolution configuration

[![Output Resolution Page](images/output_selection.png)](#)

- Tracks changes in Video Input and Output Config
    - This is to ensure the User Feedback is always up to date
- Applies Configuration changes to inputs and outputs on selection

## Installation
- Download the Resolution-Switcher.js file
- Log into the WebUI of the Video Endpoint
- Navigate to the Macro Editor
- Select Import from file
- Select the Resolution-Switcher.js file
- Save the Macro
- Activate the Macro