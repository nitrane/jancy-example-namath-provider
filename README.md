# Jancy Example Proxy Provider

## Structure of the Plug-in
- `example-namath-provider/package.json` - A simple file that describes the plugin to Jancy and specifies an entry point. `src/index.js` in this example.
- `example-namath-provider/src/index.js` - This is the main file that implements most of our plugins logic. The most important part is the object exported that has a couple of very specific jancy properties and functions (jancy_props, jancy_onInit, jancy_onEnabled, jancy_onDisabled). That's probably where you should start

## Adding the Plug-in to Jancy

1. Open the Jancy plug-in folder
    - On Windows, open Windows File Explorer and go to %appdata%\Jancy\plugins or on MacOS
    - On MacOS, open Finder and go to `~/Library/Application Support/Jancy/plugins`
2. Copy `example-namath-provider` folder to the plug-ins folder from step 1.
3. Restart Jancy if it's already running.
4. If everything works correctly you should see the example plugin in the list of plugins in `File -> Settings -> Plugins`.
5. Go to the Namath settings panel (`File -> Setting -> Namath`)
6. Click the + button and select the "Create a Namath Instance that sends to MyNamathExample" option
7. In the dialog that appears type in a Key and a Name. You will have to edit the dialog code to have the fields you want for your setup.
8. Press the "Add" button.
9. If all works correctly, you should see an entry for the provider instance you just created. You can press the test button to see if it works
10. You can go to TicketMaster and use Namath as you would normally and send to your provider