/**
 * Script for overlay.ejs
 */

/* Overlay Wrapper Functions */

/**
 * Check to see if the overlay is visible.
 * 
 * @returns {boolean} Whether or not the overlay is visible.
 */
function isOverlayVisible() {
    return document.getElementById('main').hasAttribute('overlay')
}

let overlayHandlerContent

/**
 * Overlay keydown handler for a non-dismissable overlay.
 * 
 * @param {KeyboardEvent} e The keydown event.
 */
function overlayKeyHandler(e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEnter')[0].click()
    }
}
/**
 * Overlay keydown handler for a dismissable overlay.
 * 
 * @param {KeyboardEvent} e The keydown event.
 */
function overlayKeyDismissableHandler(e) {
    if (e.key === 'Enter') {
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEnter')[0].click()
    } else if (e.key === 'Escape') {
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEsc')[0].click()
    }
}

/**
 * Bind overlay keydown listeners for escape and exit.
 * 
 * @param {boolean} state Whether or not to add new event listeners.
 * @param {string} content The overlay content which will be shown.
 * @param {boolean} dismissable Whether or not the overlay is dismissable 
 */
function bindOverlayKeys(state, content, dismissable) {
    overlayHandlerContent = content
    document.removeEventListener('keydown', overlayKeyHandler)
    document.removeEventListener('keydown', overlayKeyDismissableHandler)
    if (state) {
        if (dismissable) {
            document.addEventListener('keydown', overlayKeyDismissableHandler)
        } else {
            document.addEventListener('keydown', overlayKeyHandler)
        }
    }
}

/**
 * Toggle the visibility of the overlay.
 * 
 * @param {boolean} toggleState True to display, false to hide.
 * @param {boolean} dismissable Optional. True to show the dismiss option, otherwise false.
 * @param {string} content Optional. The content div to be shown.
 */
function toggleOverlay(toggleState, dismissable = false, content = 'overlayContent') {
    if (toggleState == null) {
        toggleState = !document.getElementById('main').hasAttribute('overlay')
    }
    if (typeof dismissable === 'string') {
        content = dismissable
        dismissable = false
    }
    bindOverlayKeys(toggleState, content, dismissable)
    if (toggleState) {
        document.getElementById('main').setAttribute('overlay', true)
        // Make things untabbable.
        $('#main *').attr('tabindex', '-1')
        $('#' + content).parent().children().hide()
        $('#' + content).show()
        if (dismissable) {
            $('#overlayDismiss').show()
        } else {
            $('#overlayDismiss').hide()
        }
        $('#overlayContainer').fadeIn({
            duration: 150,
            start: () => {
                if (getCurrentView() === VIEWS.settings) {
                    document.getElementById('settingsContainer').style.backgroundColor = 'transparent'
                }
            }
        })
    } else {
        document.getElementById('main').removeAttribute('overlay')
        // Make things tabbable.
        $('#main *').removeAttr('tabindex')
        $('#overlayContainer').fadeOut({
            duration: 150,
            start: () => {
                if (getCurrentView() === VIEWS.settings) {
                    document.getElementById('settingsContainer').style.backgroundColor = 'rgba(0, 0, 0, 0.50)'
                }
            },
            complete: () => {
                $('#' + content).parent().children().hide()
                $('#' + content).show()
                if (dismissable) {
                    $('#overlayDismiss').show()
                } else {
                    $('#overlayDismiss').hide()
                }
            }
        })
    }
}

function toggleServerSelection(toggleState) {
    prepareServerSelectionList()
    toggleOverlay(toggleState, true, 'serverSelectContent')
    DiscordWrapper.updateDetails('Selecting Server...')
}

/**
 * Set the content of the overlay.
 * 
 * @param {string} title Overlay title text.
 * @param {string} description Overlay description text.
 * @param {string} acknowledge Acknowledge button text.
 * @param {string} dismiss Dismiss button text.
 */
function setOverlayContent(title, description, acknowledge, dismiss = 'Dismiss') {
    document.getElementById('overlayTitle').innerHTML = title
    document.getElementById('overlayDesc').innerHTML = description
    document.getElementById('overlayAcknowledge').innerHTML = acknowledge
    document.getElementById('overlayDismiss').innerHTML = dismiss
}

/**
 * Set the onclick handler of the overlay acknowledge button.
 * If the handler is null, a default handler will be added.
 * 
 * @param {function} handler 
 */
function setOverlayHandler(handler) {
    if (handler == null) {
        document.getElementById('overlayAcknowledge').onclick = () => {
            toggleOverlay(false)
        }
    } else {
        document.getElementById('overlayAcknowledge').onclick = handler
    }
}

/**
 * Set the onclick handler of the overlay dismiss button.
 * If the handler is null, a default handler will be added.
 * 
 * @param {function} handler 
 */
function setDismissHandler(handler) {
    if (handler == null) {
        document.getElementById('overlayDismiss').onclick = () => {
            toggleOverlay(false)
        }
    } else {
        document.getElementById('overlayDismiss').onclick = handler
    }
}

/* Server Select View */

document.getElementById('serverSelectConfirm').addEventListener('click', () => {
    const listings = document.getElementsByClassName('serverListing')
    for (let i = 0; i < listings.length; i++) {
        if (listings[i].hasAttribute('selected')) {
            const serv = DistroManager.getDistribution().getServer(listings[i].getAttribute('servid'))
            updateSelectedServer(serv)
            refreshServerStatus(true)
            toggleOverlay(false)
            DiscordWrapper.updateDetails('Ready to Play!')
            DiscordWrapper.updateState('Server: ' + serv.getName())

            if (i == 0) { //If Magnifico Pack
                document.body.style.backgroundImage = `url('assets/images/backgrounds/henrikolauncher_background_gif_60q.gif')`
                document.getElementById('modpacklogoimg').src = "assets/images/logos/magnificopack_logo.png"
            }
            else if (i == 1) { //If Yao Pack
                document.body.style.backgroundImage = `url('assets/images/backgrounds/henrikolauncher_background_gif_100q_night.gif')`
                document.getElementById('modpacklogoimg').src = "assets/images/logos/yaopack_logo.png"
            }
            else if (i == 2) { //If BitCraft
                document.body.style.backgroundImage = `url('assets/images/backgrounds/henrikolauncher_background_gif_100q_bitcraft.gif')`
            }
            else if (i == 3) { //If EnhancedMC
                document.body.style.backgroundImage = `url('assets/images/backgrounds/enhancedmc_screenshot1.jpg')`
            }

            return
        }
    }
    // None are selected? Not possible right? Meh, handle it.
    if (listings.length > 0) {
        const serv = DistroManager.getDistribution().getServer(listings[i].getAttribute('servid'))
        updateSelectedServer(serv)
        toggleOverlay(false)
    }
})

document.getElementById('accountSelectConfirm').addEventListener('click', () => {
    const listings = document.getElementsByClassName('accountListing')
    for (let i = 0; i < listings.length; i++) {
        if (listings[i].hasAttribute('selected')) {
            const authAcc = ConfigManager.setSelectedAccount(listings[i].getAttribute('uuid'))
            ConfigManager.save()
            updateSelectedAccount(authAcc)
            toggleOverlay(false)
            validateSelectedAccount()
            return
        }
    }
    // None are selected? Not possible right? Meh, handle it.
    if (listings.length > 0) {
        const authAcc = ConfigManager.setSelectedAccount(listings[0].getAttribute('uuid'))
        ConfigManager.save()
        updateSelectedAccount(authAcc)
        toggleOverlay(false)
        validateSelectedAccount()
    }
})

// Bind server select cancel button.
document.getElementById('serverSelectCancel').addEventListener('click', () => {
    toggleOverlay(false)
})

document.getElementById('accountSelectCancel').addEventListener('click', () => {
    $('#accountSelectContent').fadeOut(150, () => {
        $('#overlayContent').fadeIn(150)
    })
})

$('#serverSelectListScrollable').on('mousewheel', function(event, delta) {
    let speed = event.originalEvent.deltaY > 0 ? event.originalEvent.deltaY - 60 : event.originalEvent.deltaY + 60
    this.scrollLeft += speed
    event.preventDefault()
})

function setServerListingHandlers(){
    const listings = Array.from(document.getElementsByClassName('serverListing'))
    listings.map((val) => {
        val.onclick = e => {
            if (val.hasAttribute('selected')) {
                return
            }
            const cListings = document.getElementsByClassName('serverListing')
            for (let i = 0; i < cListings.length; i++) {
                if (cListings[i].hasAttribute('selected')) {
                    cListings[i].removeAttribute('selected')
                }
            }
            val.setAttribute('selected', '')
            document.activeElement.blur()
        }
    })
}

function setAccountListingHandlers() {
    const listings = Array.from(document.getElementsByClassName('accountListing'))
    listings.map((val) => {
        val.onclick = e => {
            if (val.hasAttribute('selected')) {
                return
            }
            const cListings = document.getElementsByClassName('accountListing')
            for (let i = 0; i < cListings.length; i++) {
                if (cListings[i].hasAttribute('selected')) {
                    cListings[i].removeAttribute('selected')
                }
            }
            val.setAttribute('selected', '')
            document.activeElement.blur()
        }
    })
}

function populateServerListings() {
    const distro = DistroManager.getDistribution()
    const giaSel = ConfigManager.getSelectedServer()
    const servers = distro.getServers()
    let htmlString = ''
    for(const serv of servers){
        if(serv.getServerCode() && !ConfigManager.getServerCodes().includes(serv.getServerCode())){
            continue
        }
        htmlString += `<button class="serverListing" servid="${serv.getID()}" ${serv.getID() === giaSel ? 'selected' : ''}>
            <div class="serverListingDetails">
                <img class="serverListingImg" src="${serv.getIcon()}"/>
                <div class="serverListingName">${serv.getName()}</div>
                <div class="serverListingInfo">
                    <div class="serverListingRevision">${serv.getVersion()}</div>
                </div>
                <div class="serverListingDescription">${serv.getDescription()}</div>
                <div class="serverSelectedText">Selected!</div>
                <div class="serverSelectedText">
                    <a href="https://drive.google.com/drive/folders/1SFxRd_Y4QW3dWtuHbUkEYmx1GgCWuouE?usp=sharing" class="serverDownloadButton" type="submit">Download Server Builder</a>
                </div>
            </div>
        </button>`
    }
    document.getElementById('serverSelectListScrollable').innerHTML = htmlString

}

function populateAccountListings() {
    const accountsObj = ConfigManager.getAuthAccounts()
    const accounts = Array.from(Object.keys(accountsObj), v => accountsObj[v])
    let htmlString = ''
    for(let i=0; i<accounts.length; i++){
        htmlString += `<button class="accountListing" uuid="${accounts[i].uuid}" ${i===0 ? 'selected' : ''}>
            <img src="https://mc-heads.net/head/${accounts[i].uuid}/40">
            <div class="accountListingName">${accounts[i].displayName}</div>
        </button>`
    }
    document.getElementById('accountSelectListScrollable').innerHTML = htmlString

}

function prepareServerSelectionList() {
    populateServerListings()
    setServerListingHandlers()
}

function prepareAccountSelectionList() {
    populateAccountListings()
    setAccountListingHandlers()
}