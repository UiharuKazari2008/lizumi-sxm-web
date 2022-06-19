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
