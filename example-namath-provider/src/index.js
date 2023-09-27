const {EventEmitter} = require('events')
let myMessageAPI = null

const MyNamathExampleProviderFactory = {
  id: '69c30bd7-0ae7-4d2e-9517-69414d850a42', //generate a uuid that you want
  description: 'Create a Namath Instance that sends to MyNamthExample', //this text shows up in Namath when users click the '+' button to add a provider
  showFactoriesToUser: true,
  persistProviders: true,
  createProvider(jancy, state=null) {
    return new MyNamathExampleProvider(jancy, state)
  },
  addProvider(jancy, browserWindow) {
    providerDialog(jancy, browserWindow)
  },
  editProvider(jancy, browserWindow, provider) {
    providerDialog(jancy, browserWindow, provider)
  }
}

/**
 * This is an example of a service that you would create to send messages to your service
 * the constructor is called with the provider's state object and the jancy object
 */
class MyNamathExampleProvider {
  constructor(jancy, { key, providerName, instance_id } = {}) {
    this.jancy = jancy
    console.log(providerName, key, instance_id)
    this.name = providerName || `This example name`
    this.key = key //could be a key or token, but you are in control of these variables
    this.instance_id = instance_id
  }
  getName() {
    return this.name
  }
  getInfo() {
    return `Some friendly info about this provider will be displayed in namath`
  }
  /**
   * This is called to resend the cart to the provider - since it can vary from 
   * marketplace to marketplace it can change when it will be called
   * @param {*} param0 - {cart is the cart object with all the sale info
   * tab is the jancy tab object that the cart was sent from,
   * respFunction is a callback that you call when you get a response from the provider
   */
  bumpCart({cart, tab, respFunction}) {
    myMessageAPI.bumpCart(cart.uuid)
  }
  /**
   * Called to expire a cart so it doesn't show up in namath anymore
   * @param {*} param0 - {cart is the cart object with all the sale info} 
   */
  expireCart({cart}) {
    myMessageAPI.expireCart(cart.uuid)
  }
  /**
   * Send the cart to where ever you want to send it
   * @param {*} param0 - {cart is the cart object with all the sale info
   * tab is the jancy tab object that the cart was sent from,
   * respFunction is a callback that you call when you get a response from the provider
   * }
   */
  sendCart({cart, tab, respFunction}) {
    //you need to send these args to myMessageAPI.sendCart
    let args = {
      wantsResponse:true,
      cart: cart
    }
    //example of a event your api emits that indicates a quarterback has send a response back
    // it then calls the callback in namath that will show to the user the quarterback's decision
    myMessageAPI.on('cartResponse', (cart, isApproved, respondingUser) => {
      respFunction(cart, isApproved, respondingUser, false)
    })
    myMessageAPI.sendCart({key:this.key}, args)
  }
  /** Return an object that can be fed back into the constructor to
  * recreate this provider. This is needed to restore the provider 
  * after Jancy restarts
  */
  getState() {
    return  {
      providerName: this.name,
      key: this.key,
      instance_id: this.instance_id
    }
  }
  test() {
    myMessageAPI.sendTest()
  }
  
}

/**
 * This dialog will be shown to the user when they click the '+' button in namath.
 * In it you should display values that allows the user to choose the specifics of your service provider
 * needed to send namath carts.
 * It's invocation is handled in the provider factory
 * @param {*} jancy (Jancy)
 * @param {*} browserWindow (BrowserWindow) 
 * @param {*} provider (NamathProvider): optional - for editing an existing provider (namath isn't ready for this yet)
 */

function providerDialog (jancy, browserWindow, provider=null) {

  let providerWindow = this.jancy.dialogFactory.create(
    browserWindow,
    {
      width: 400,
      height: 150,
      title: provider ? `Edit ${ provider.getName() }` : 'Configure Example Namath Provider'
    },
    {
      centerRelativeToParent: true
    }
  )

  jancy.actionRegistry.register("example-namath-provider:save", (args, sender) => {
    /* args is the provider state object essentially
    args = {
      key: '1234',
      providerName: 'My Provider Name',
      instance_id: '1234'
    }
    */
   if (!provider) {
    args.instance_id = '1234' //this is a uuid that you generate and in this example can be used to identify the provider
   }
    const namath = jancy.getInterface('namathAPI')
    if (namath) {
      console.log(args)
      namath.createProvider(MyNamathExampleProviderFactory, args)
    }
  })

  providerWindow.on('ready-to-show', () => {

    const css = `
      p {
        padding: 5px 0;
      }
      .input-textfield {
        flex-grow: 1;
      }
      .button-container {
        width: 100%;
        justify-content: flex-end;
      }
    `

    providerWindow.webContents.insertCSS(css)

    const html = `
      <div class="block my-content">
        <div class="inline-block">
          <label class="input-label">Key</label>
          <input class="input-textfield" name="key" value="${ provider ? provider.key : ""}" />
        </div>
        <div class="inline-block">
          <label class="input-label">Name</label>
          <input class="input-textfield" name="providerName" value="${ provider ? provider.providerName : ""}" />
        </div>
        <div class="inline-block button-container">
          <button class="button" onclick="window.close()">Cancel</button>
          <button class="button" onclick="window.onSave()">${ provider ? "Update" : "Add" }</button>
        </div>
      </div>
    `
    // this is the code that will be executed in the browser window, it will set up the html and JS needed for the dialog
    const code = `
      (function () {
        window.onSave = (event) => {
          const key = document.body.querySelector('input[name="key"]').value
          const providerName = document.body.querySelector('input[name="providerName"]').value
          if (key.trim().length > 0 && providerName.trim().length > 0) {
            window.jancyAPI.dispatchAction("example-namath-provider:save", {
              key,
              providerName
            })
            window.close()
          }
        }
        document.body.innerHTML = \`${html}\`
      })()
    `

    providerWindow.on('close', () => {
      jancy.actionRegistry.unregister("example-namath-provider:save")
    })

    providerWindow.webContents.executeJavaScript(code)
    providerWindow.show()
  })
}
class MyMessageAPI extends EventEmitter {
  
  constructor(jancy) {
    super()
    this.jancy = jancy
  }
  sendCart({key}, {cart, wantsResponse}) {
    console.log('cart sent to with key', key)
    if (wantsResponse) {
      this.emit('cartResponse', cart, true, 'some user')
    }
  }
  sendTest() {
    console.log('test sent')
  }
  bumpCart(cart_id) {
    console.log('cart bumped')
  }
  expireCart(cart_id) {
    console.log('cart expired')
  }

}

module.exports = {

  jancy_props: {
    registryVersion: 1,
    canDisable: false
  },

  /* --------------------------------------------------------------------------
  ** Called by the pluginRegistry when we are loaded.
  ** ------------------------------------------------------------------------*/
  jancy_onInit(jancy, enabled) {
    
    myMessageAPI = new MyMessageAPI(jancy)

    //check to see if namath is ready to add this provider factory
    const namath_check = setInterval(() => {
      const namath = jancy.getInterface('namathAPI')
      if (namath) {
        namath.addFactory(MyNamathExampleProviderFactory)
        clearInterval(namath_check)
      }
      
    }, 500);

    jancy.registerInterface('myMessageAPI', myMessageAPI)
  },
}