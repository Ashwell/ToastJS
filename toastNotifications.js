/*******
 * Toast Notification JS Module
 * Author: Ryan Bogle (ryan.bogle@gmail.com)
 * Version: 0.1
 * Date: 8/19/2013
 *
 * This is a simple toast notification center written in a pure JavaScript (requires ECMAScript 5).
 * Some Features include:
 *    Automatic clean up of old toast notifications. (Garbage collection)
 *    Automatic recreation of notification wrapper if destroyed. (Note: this only works when using the default
 *      notification center selector, using a custom selector will break this functionality)
 *    CSS3 Transitions and Animations included in toastNotification.less
 *
 *
 *  Available Options:
 *    --Key--         --Value Type--          --Default Value--     --Purpose--
 *    persist:           boolean                  false             Forces message to persist until the user takes action to close it.
 *    closeable:         boolean                  false             Show(true) or Hide(false) Close button (persist messages always have close button)
 *    longToast:         boolean                  false             When true, message will use 'timeVisibleLong' instead of 'timeVisible'
 *    enterTiming:       string:timing-function   linear            Timing function for entrance animation.
 *    exitTiming:        string:timing-function   linear            Timing function for exit animation.
 *    timeToEnter:       string:Time              '2s',             Time (in 's' or 'ms') for entrance animation.
 *    timeToExit:        string:Time              '2.5s',           Time (in 's' or 'ms') for exit animation.
 *    timeVisible:       string:Time              '3s',             Time (in 's' or 'ms') for message to be visible after entrance animation and before exit animation.
 *    timeVisibleLong:   string:Time              '5s',             Time (in 's' or 'ms') for message to be visible after entrance animation and before exit animation when longToast is true.
 *    enterAnimation:    string:keyframes name    'toastEnter',     Name of entrance animation. (ie: @keyframes toastEnter { ... })
 *    exitAnimation:     string:keyframes name    'toastExit',      Name of exit animation. (ie: @keyframes toastExit { ... })
 *
 *  Many of these options are used to build the animation definitions, so they should follow the standards for the CSS3 properties they represent.
 *  Time options (timeToEnter, timeToExit, etc.) must be in seconds (s) or milliseconds (ms). They must carry one and only one of these two units, but units may be different from option to option.
 *
 *  Set Up
 *    Once the script is loaded call toast.init(options) with optional options parameter to set user options, build notification center and attach toast to window.toast.
 *
 *    Using a custom selector: NOT RECOMMENDED!
 *    If you wish to use a custom wrapper for holding the toast notifications pass in the selector as a string value keyed as: 'containerSelector' in the options object when calling init.
 *      This only works during the init function, and it will also break the ability for toast notifications to rebuild it's container if it accidentally gets destroyed.
 *      If you do use a custom selector and the selector does not find a container toast notifications will default back to it's standard selector and rebuild itself using 'body > .toastNotificationCenter'.
 *
 *  Setting Options
 *    There are three ways to set options, two will affect all subsequent toast notifications, and one will only affect the current toast being created.
 *    Affecting all subsequent toasts
 *      Setting options via toast.init(options)     
 *      Setting options via toast.userOptions = options
 *    Affection only current toast
 *      Passing in options to toast.makeToast(msg, options)
 *
 *    Examples:
 *      Setting during toast.init:
 *        toast.init({
 *          enterTiming:'ease',
 *          exitTiming: 'linear',
 *          timeToEnter: '2500ms',
 *          timeVisible: '4s'
 *        });
 *
 *      Persistent change at anytime using toast.userOptions:
 *        toast.userOptions = {
 *          enterTiming:'linear',
 *          longToast:true,
 *          timeVisibleLong:'8s',
 *          closeable: true
 *        };
 *        NOTE: Setting toast.userOptions = null will set all options to their default value.
 *
 *      One Time setting change:
 *        toast.makeToast("Hello World!", {persist:true, timeToEnter:'1.5s'});
 *        Known bug: Changing 'timeToExit' when persist is true will not take effect on toast exit.
 *    
 *  Usage
 *    There are several ways to create a toast notification.
 *    The simplest ways will use any user options previously set or fall back to the default options for any options not set by the user.
 *    All toasts need a message to display, this can be either a string, a string containing HTML or an element object.
 *
 *    Simple Toast Creation
 *      toast.short(msg)
 *        This will create a standard short toast as defined by user and default options. Visibility time will be set by 'timeVisible'
 *  
 *      toast.long(msg)
 *        This will create a standard long toast as defined by user and default options. Visibility time will be set by 'timeVisibleLong'
 *  
 *      toast.closeable(msg)
 *        This will create a standard short toast just like toast.short, but the toast will have a close button, regardless of user and default options.
 *  
 *      toast.persistent(msg)
 *        This will create a standard persistent toast that will only disappear once the user has clicked a close button on the toast itself.
 *
 *      toast.success(msg, [options])
 *        This will create a standard short toast with the added class 'success' and optional options.
 *
 *      toast.error(msg, [options])
 *        This will create a standard short toast with an added class 'error' and optional options.
 *
 *      toast.info(msg)
 *        Standard info message, same as toast.short but with info sprite;
 *
 *    Custom Toast Creation
 *      toast.makeToast(msg, options)
 *        This will create a toast with the specified message and any overriding options passed in the second parameter.
 *        Any and all options can be set as part of the options object, these changes will only affect the currently created toast and will not affect the set user options.
 *        Any options not passed in will be pulled from the user options, and finally from the default options if they are not found in the parameter or user options.
 *        An extra option 'className' can be passed in as a member of the options object. This can be a string of space separated class names, or an array of strings. These classes
 *          will be added to the toast, examples would be toast.error which creates a toast with the class names .toast and .error.
 *      Examples:
 *        toast.makeToast("Hello World", {persist:true})                        // A persistent toast. This would be the same as toast.persistent("Hello World").
 *        toast.makeToast("I like jam", {closeable:true, timeVisible:'12s'})    // A long lasting toast, with a close button.
 *        toast.makeToast("I hate jam", {closeable:false, longToast:true})      // A toast using timeVisibleLong as defined by user or default options, with no close button.
 *
 *
 *  Now get to toasting!
 ******/

var toast = {
  containerSelector: "body > .toastNotificationCenter",
  get defaultContainerSelector() { return "body > .toastNotificationCenter"; },
  get container() {
    var c = document.querySelector(this.containerSelector);
    if(c == null){
      this.containerSelector = this.defaultContainerSelector;
      var c = document.createElement("div");
      c.className = "toastNotificationCenter";
      document.body.appendChild(c);
      this.events();
    }
    return c;
  },
  get defaultOptions() {
    return {
      persist:        false,
      closeable:      false,
      longToast:      false, 
      enterTiming:    'linear',
      exitTiming:     'linear',
      timeToEnter:     '1s',
      timeToExit:      '.5s',
      timeVisible:     '1s',
      timeVisibleLong: '5s',
      enterAnimation:  'toastEnter',
      exitAnimation:   'toastExit'
    };
  },
  get userOptions(){
    return ( (this.currentOptions == null) ? this.defaultOptions : this.currentOptions );
  },
  set userOptions(opts){
    // if options set to null, all options reset to default;
    if(opts == null){
      this.currentOptions = this.defaultOptions;
      return;
    }
    // for each option in default options
    //     if prop exists in argument add value from opts
    //     else if prop exists in currentOptions add
    //     else add from defaultOptions
    var i, currProp, newOpts = {},
        defaults    = this.defaultOptions,
        currentOpts = this.currentOptions,
        optionProps = Object.getOwnPropertyNames(defaults);

    for(i=0; i < optionProps.length; i++){
      currProp = optionProps[i];
      if( opts.hasOwnProperty(currProp) )
        newOpts[currProp] = opts[currProp];
      else if( currentOpts.hasOwnProperty(currProp) )
        newOpts[currProp] = currentOpts[currProp];
      else
        newOpts[currProp] = defaults[currProp];
    }

    // set currentOptions to new options
    this.currentOptions = newOpts;
  },
  init:function(options) {
    // if options exists
    this.currentOptions = this.defaultOptions;
    if(options){
      if(options.hasOwnProperty("containerSelector"))
        this.containerSelector = options.containerSelector;

      this.userOptions = options;
    }
    else{
      this.userOptions = this.defaultOptions;
    }
    // build container
    var dummy = this.container;

    // export to window
    if( window.toast == null )
      window.toast = this;

    //console.log("Toast Notifications Initilized");
  },
  events:function(){
    // Click Close button on toast
    this.container.onclick = function(e) {
      var target = e.target;
      if(target.tagName === 'SPAN' && target.className.search(/close/) > -1){
        target.parentNode.setAttribute('style', toast.animation.exit()); 
      }
    };

    // animation end listener
    var endAnimation = function(e) {
        if(e.animationName === toast.userOptions.exitAnimation){
          e.target.style.height = "0";
          e.target.style.display = "none";
        }
        toast.cleanUp();
    };

    // Attach animation end listener
    toast.container.addEventListener("animationend", endAnimation);
    toast.container.addEventListener("webkitAnimationEnd", endAnimation);
    toast.container.addEventListener("oAnimationEnd", endAnimation);
    // End Events
  },
  cleanUp:function() {
    var i, t, style, toasts = this.container.children;
    if(!toasts){ console.log("no toasts to clean up"); return false; }
    for(i=0, t=toasts[i]; i < toasts.length; t=toasts[++i]){
      style = window.getComputedStyle(t, null);
      if(
        style.getPropertyValue("display")     == 'none'   ||
        style.getPropertyValue("visibility")  == 'hidden' 
        ){
          this.container.removeChild(t);
      }
    }
    return true;
  },
  animation:{
    //animation: name duration timing-function delay iteration-count direction fill-mode play-state;
    get prefix() { return ""+( (navigator.userAgent.search(/chrome|webkit|safari/gi) !== -1) ? '-webkit-' : '' ); },
    getDelay:function(opt){
      if(opt == null) opt = toast.userOptions;
      var entrance = (opt.hasOwnProperty('timeToEnter') ? opt.timeToEnter : toast.userOptions.timeToEnter),
          visible  = (opt.hasOwnProperty('timeVisible') ? opt.timeVisible : toast.userOptions.timeVisible);

      entrance = (entrance.search(/m/i) === -1 ? parseFloat(entrance)*1000 : parseInt(entrance));
      visible  = (visible.search(/m/i)  === -1 ? parseFloat(visible) *1000 : parseInt(visible) );
      return (entrance+visible)+'ms';
    },
    getLongDelay:function(opt){
      if( opt.hasOwnProperty('timeVisibleLong') ){
        opt.timeVisible = opt.timeVisibleLong;
        return this.getDelay(opt);
      }else{
        opt.timeVisible = toast.userOptions.timeVisibleLong;
        return this.getDelay(opt);
      }
    },
    enter:function(opt){
      if(opt == null) opt = toast.userOptions;
      var ani = (toast.animation.prefix + 'animation:'
            + " " + (opt.hasOwnProperty('enterAnimation') ? opt.enterAnimation : toast.userOptions.enterAnimation) // name
            + " " + (opt.hasOwnProperty('timeToEnter')    ? opt.timeToEnter    : toast.userOptions.timeToEnter)    // duration
            + " " + (opt.hasOwnProperty('enterTiming')    ? opt.enterTiming    : toast.userOptions.enterTiming)    // timing-function
            + " 0s 1 normal"                                                                                       // delay iteration direction
      );
      return ani;
    },
    exit:function(opt){
      if(opt == null) opt = toast.userOptions;
      var ani = (toast.animation.prefix + 'animation:'
            + " " + (opt.hasOwnProperty('exitAnimation') ? opt.exitAnimation : toast.userOptions.exitAnimation)
            + " " + (opt.hasOwnProperty('timeToExit')    ? opt.timeToExit    : toast.userOptions.timeToExit)
            + " " + (opt.hasOwnProperty('exitTiming')    ? opt.exitTiming    : toast.userOptions.exitTiming)
            + " 0s 1 normal"
      );
      return ani;
    },
    full:function(opt){
        var enter = this.enter(opt),
            exit  = this.exit(opt),
            delay = this.getDelay(opt);
        exit = exit.replace(/-webkit-/gi, "").replace(/animation:/gi, "").replace(/0s 1/g, delay+" 1");
        return enter+", "+exit;
    },
    long:function(opt) {
        var enter = this.enter(opt),
            exit  = this.exit(opt),
            delay = this.getLongDelay(opt);
        exit = exit.replace(/-webkit-/gi, "").replace(/animation:/gi, "").replace(/0s 1/g, delay+" 1");
        return enter+", "+exit;
    }
  },
  buildToast:function(msg) {
    if(!msg){ 
      throw {
        name: 'BuildToastException',
        message: "No message provided to make toast. Toast always needs something on it! C'mon!"
      };
    }
    var t = document.createElement("div"),
        msgDiv = document.createElement("div");
        close  = document.createElement("span");
    t.className = "toast";
    msgDiv.className = "msg";
    close.className = "close";

    if(typeof msg === 'string'){
      msgDiv.innerHTML = msg;
    }else if(typeof msg === 'object'){
      if(msg instanceof Node || msg instanceof HTMLElement){
        msgDiv.appendChild(msg);
      }else if(typeof msg === 'object' && 'undefined' !== typeof msg.nodeType && 'undefined' !== typeof msg.nodeName){
        msgDiv.appendChild(msg);
      }else{
        console.log("Toast Error:\n", "msg:", msg, " t:", t);
        throw{
          name: 'BuildToastException',
          message: "Could not create toast because message was not an accepted type, String or Node."
        };
      }
    }
    t.appendChild(msgDiv);
    t.appendChild(close);
    return t;
  },
  postToast:function(newToast) {
    if(newToast){
      this.container.appendChild(newToast);
    }else{
      throw{
        name: 'PostToastException',
        message: 'No toast to post.'
      }
    }
  },
  makeToast:function(msg, options) {
    if(options == null){ options = this.userOptions; }
    try{
      var ani, t = this.buildToast(msg); 

      // Add optional Class Names
      if(options.hasOwnProperty('className')){
        if(typeof options.className === 'string'){
          t.className += " " + options.className;
        }
        else if(options.className instanceof Array){
          var i, str = ""
          for(i=0; i < options.className.length; i++){
            if(typeof options.className[i] === 'string'){
              str = str + " " + options.className[i];
            }
          }
          t.className += str;
        }
      }

      // if persisting message
      if( (options.hasOwnProperty('persist') && options.persist)
          || (!options.hasOwnProperty('persist') && toast.userOptions.persist)
      ){
        t.className += " close";
        t.setAttribute('style', toast.animation.enter(options));
        this.postToast(t);
        return this;
      }

      // if needs close button, add close class to show close button
      if( (options.hasOwnProperty('closeable') && options.closeable)
          || (!options.hasOwnProperty('closeable') && toast.userOptions.closeable)
      ){
        if(t.className.search(/close/) === -1)
          t.className += " close";
      }

      // if it is a long toast
      if( (options.hasOwnProperty('longToast') && options.longToast)
          || (!options.hasOwnProperty('longToast') && toast.userOptions.longToast)
      ){
        ani = toast.animation.long(options);
      } else {
        ani = toast.animation.full(options);
      }

      // Apply inline animation
      t.setAttribute('style', ani);

      // Post Notification
      this.postToast(t);

    }catch(e){
      if(e.name.search(/ToastException/) > -1 ){
        console.error("Toast Exception! Error building toast: ", e.message);
        console.error("Stack Trace: ", e.stack);
      }else{
        console.error("Non-Toast Exception in Toast Notifications: ", e.name, e.message);
        console.error("Stack Trace: ", e.stack);
      }
    }
    return this;
  },
  short:function(msg) {
    this.makeToast(msg, {longToast:false}); 
    return this;
  },
  long:function(msg) {
    this.makeToast(msg, {longToast:true});
    return this;
  },
  closeable:function(msg) {
    this.makeToast(msg, {closeable:true});
    return this;
  },
  persistent:function(msg) {
    this.makeToast(msg, {persist:true});
    return this;
  },
  success:function(msg, options) {
    if(options == null)
      options = {};
    if( 'undefined' !== typeof options.className && options.className.search(/success/gi) === -1 ){
      options.className += " success";
    } else { options.className = "success"; }

    this.makeToast(msg, options);
    return this;
  },
  error:function(msg, options) {
    if(options == null)
      options = {};
    if('undefined' !== typeof options.className && options.className.search(/error/gi) === -1){
      options.className += " error";
    }else{ options.className = "error"; }

    if('undefined' === typeof options.longToast){ options.longToast = false; }
    this.makeToast(msg, options);
    return this;
  },
  info:function(msg){
    this.makeToast(msg, {className:"info"});
    return this;
  }
};
