async function displayErrorMessage(message, timed = true) {
    if (!($("#error-popup").length)) {
        let fakeJSX = `<div id="error-popup">
                        <div id="error-popup-wrapper">
                        <svg id="close" onclick="$('#block-screen-error').remove();$('#error-popup').remove();" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512">
                            <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                             <path fill="white"
                            d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM175 208.1L222.1 255.1L175 303C165.7 312.4 165.7 327.6 175 336.1C184.4 346.3 199.6 346.3 208.1 336.1L255.1 289.9L303 336.1C312.4 346.3 327.6 346.3 336.1 336.1C346.3 327.6 346.3 312.4 336.1 303L289.9 255.1L336.1 208.1C346.3 199.6 346.3 184.4 336.1 175C327.6 165.7 312.4 165.7 303 175L255.1 222.1L208.1 175C199.6 165.7 184.4 165.7 175 175C165.7 184.4 165.7 199.6 175 208.1V208.1z" />
                         </svg>
                        <p>${message}</p>   
                        </div>
                    </div>`;
        $("body").append(fakeJSX);
        let height = $(document).height();
        $("body").append(`<div id='block-screen-error' style="height:${height}px"></div>`);
        if (timed) {
            await sleep(2500);
            $("#error-popup").remove();
            $("#block-screen-error").remove();
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showLive() {
    $('#past-collections').addClass('hidden');
    $('#live-collections').removeClass('hidden');
    if ($("#live-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#live-button").addClass("active");
    $("#past-button").removeClass("active");
}

function showPast() {
    $('#live-collections').addClass('hidden');
    $('#past-collections').removeClass('hidden');
    if ($("#past-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#past-button").addClass("active");
    $("#live-button").removeClass("active");
}

function showCreate() {
    $('#past-collections').addClass('hidden');
    $('#live-collections').removeClass('hidden');
    if ($("#live-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#listing-select-div").addClass('hidden');
    $("#create-button").addClass("active");
    $("#modify-button").removeClass("active");
}

function showModify() {
    $('#live-collections').addClass('hidden');
    $('#past-collections').removeClass('hidden');
    if ($("#past-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#listing-select-div").removeClass('hidden');
    $("#modify-button").addClass("active");
    $("#create-button").removeClass("active");
}

function toggleMenu() {
    const el = document.getElementById("mobile-nav-menu")
    el.classList.toggle('expanded')
    el.classList.toggle('collapsed')
}

function clearPendingTxs() {
    localStorage.removeItem("AscensionMarketPendingTxs");
    pendingTransactions.clear();
    location.reload();
};

// ======= DISCORD UTILS ========

// Mainnet
const identityMapperAddress = "0xaD48C81ac9CdcD4fE3e25B8493b2798eA5104e6f";

// Testnet
//  const identityMapperAddress = "0xffccE647DA8a266A8779875b9c68cb51DC236C80";

const identityMapperAbi = () => {
    return `[{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"addressToDiscord","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"addressToTwitter","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"discordTag_","type":"string"}],"name":"setDiscordIdentity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"twitterTag_","type":"string"}],"name":"setTwitterIdentity","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
}

const providerID = new ethers.providers.Web3Provider(window.ethereum, "any");
const signerID = providerID.getSigner();

const identityMapper = new ethers.Contract(identityMapperAddress, identityMapperAbi(), signerID);

const promptForDiscord = async () => {
    if (!($("#discord-popup").length)) {
        let userAddress = await signer.getAddress();
        let currentDiscord = await identityMapper.addressToDiscord(userAddress);
        let discordString = currentDiscord ? currentDiscord : "None";
        let fakeJSX = `<div id="discord-popup">
                         <div id="content">
                          <p>Enter Discord User ID to associate with purchases.</p>
                          <p>Current: ${discordString}</p>
                          <br>
                          <input id="discord-name" type="text" spellcheck="false" value="" placeholder="user#1234">
                          <br>
                          <button class="button" onclick="setDiscord()"">SET DISCORD</button>
                         </div>
                        </div>`;
        $("body").append(fakeJSX);
        let height = $(document).height();
        $("body").append(`<div id='block-screen-discord' style="height:${height}px" onclick="$('#discord-popup').remove();$('#block-screen-discord').remove()"></div>`);
    }
}

const setDiscord = async () => {
    try {
        let name = $("#discord-name").val();
        console.log(name)
        if (name == "") {
            await displayErrorMessage(`Error: No User ID provided!`);

        }
        else if (!(name.includes("#"))) {
            await displayErrorMessage(`Error: Must include "#" and numbers in ID!`);
        }
        else {
            await identityMapper.setDiscordIdentity(name).then(async (tx_) => {
                await waitForTransaction(tx_);
                $("#set-discord-button").html(`Setting<span class="one">.</span><span class="two">.</span><span class="three">.</span>`)
                $('#discord-popup').remove();
                $('#block-screen-discord').remove();
            });
        }
    }
    catch (error) {
        if ((error.message).includes("User denied transaction signature")) {
            console.log("Transaction rejected.");
        }
        else {
            await displayErrorMessage("An error occurred. See console and window alert for details...")
            window.alert(JSON.stringify(error));
            console.log(error);
        }
    }
}

var discordSet = false;

const updateDiscord = async () => {
    if (!discordSet) {
        let userAddress = await getAddress();
        let currentDiscord = await identityMapper.addressToDiscord(userAddress);
        if (currentDiscord) {
            discordSet = true
            $("#set-discord-button").addClass("hidden");
            $("#discord-text").text("SET!");
            $("#discord").addClass("success");
            $("#discord").removeClass("failure");
            $("#discord-text-mobile").text("SET!");
            $("#discord-mobile").addClass("success");
            $("#discord-mobile").removeClass("failure");
            $("#discord-img").attr("src", "./images/dc-black.png");
            $("#edit-img").attr("src", "./images/edit.png");
            $("#discord-mobile #discord-img").attr("src", "./images/dc-black.png");
            $("#discord-mobile #edit-img").attr("src", "./images/edit.png");
        }
        else {
            $("#set-discord-button").removeClass("hidden");
            $("#discord-text").text("NOT SET!");
            $("#discord").addClass("failure");
            $("#discord").removeClass("success");
            $("#discord-text-mobile").text("NOT SET!");
            $("#discord-mobile").addClass("failure");
            $("#discord-mobile").removeClass("success");
            $("#discord-img").attr("src", "./images/dc-white.png");
            $("#edit-img").attr("src", "./images/edit-white.png");
            $("#discord-mobile #discord-img").attr("src", "./images/dc-white.png");
            $("#discord-mobile #edit-img").attr("src", "./images/edit-white.png");
        }
    }
    if ($("#approval").hasClass("hidden") && $("#set-discord").hasClass("hidden")) {
        $("#onboarding-alert").addClass("hidden");
    }
    else {
        $("#onboarding-alert").removeClass("hidden");
    }
}

var timeout = 100;

setInterval(async () => {
    await updateDiscord();
    timeout = 5000;
}, timeout)