/*window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});*/

const channelsModel = $("#channelTune");
const channelsBody = $("#channelList");
const zonesModel = $("#zoneManager");
const zonesBody = $("#zoneContent");
const renameModel = $("#renameFile");
const renameGuid = $("#renameFileGuid");
const renameInput = $("#renameFileInput");
const renameChannel = $("#renameFileChannel");

function openTuner(device, digital) {
    let options = []
    if (device)
        options.push(`tuner=${device}`)
    if (digital)
        options.push(`digital=${digital}`)
    $.ajax({
        async: true,
        url: `${SEQ_APP_URL}/channelsList?${options.join('&')}`,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            channelsBody.html($(response).children());
            channelsModel.modal('show');
        },
        error: function (xhr) {
            notifyCenter("danger", "Tune", "", `Failed to get channel list`)
        }
    });
    return false;
}
function openZones() {
    let options = []
    $.ajax({
        async: true,
        url: `${SEQ_APP_URL}/zoneList?${options.join('&')}`,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            zonesBody.html($(response).children());
            zonesModel.modal('show');
        },
        error: function (xhr) {
            notifyCenter("danger", "Tune", "", `Failed to get zone manager`)
        }
    });
    return false;
}
function zoneCmd(commandUri) {
    let options = []
    $.ajax({
        async: true,
        url: `${SEQ_APP_URL}/setOutput/${commandUri}?${options.join('&')}`,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, body) {
            notifyCenter("success", "Zone Manager", "", response);
        },
        error: function (xhr) {
            notifyCenter("danger", "Zone Manager", "", `Failed to get zone manager`)
        }
    });
    return false;
}
function tuneChannel(channel, device, warning) {
    channelsModel.modal('hide');
    let options = []
    if (device)
        options.push(`tuner=${device}`)
    $.ajax({
        async: true,
        url: `${SEQ_APP_URL}/tuneChannel/${channel}?${options.join('&')}`,
        type: "GET",
        data: '',
        processData: false,
        contentType: false,
        headers: {},
        success: function (response, textStatus, xhr) {
            //console.log('Channel changed')
            if (warning)
                notifyCenter("warning", "Tune", "", `This device does not support automated tuning for ${channel}, please manually tune this tuner now`)
        },
        error: function (xhr) {
            notifyCenter("danger", "Tune", "", `Failed to tune to ${channel}`)
        }
    });
    return false;
}

function openRename(filename, ch, guid) {
    if (filename && guid && ch) {
        renameGuid[0].value = guid;
        renameChannel[0].value = ch;
        renameInput[0].value = filename;
        renameModel.modal('show');
    }
    return false;
}
function renameFile() {
    if (renameInput[0].value && renameInput[0].value.trim().length > 0) {
        renameModel.modal('hide');
        $.ajax({
            async: true,
            url: `${SEQ_APP_URL}/updateFileName?ch=${renameChannel[0].value}&guid=${renameGuid[0].value}&filename=${encodeURIComponent(renameInput[0].value.trim())}`,
            type: "GET",
            data: '',
            processData: false,
            contentType: false,
            headers: {},
            success: function (response, textStatus, xhr) {
                notifyCenter("success", "Rename", "", `Updated filename to\n"${renameInput[0].value.trim()}"`)
            },
            error: function (xhr) {
                notifyCenter("danger", "Rename", "", `Failed to update filename`)
            }
        });
    } else {
        notifyCenter("danger", "Rename", "", `Invalid Filename`)
    }
    return false;
}
