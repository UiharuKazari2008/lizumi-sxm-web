/*!
    * Start Bootstrap - SB Admin v7.0.5 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2022 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    // 
// Scripts
// 

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

const channelsModel = $("#channelTune")
const channelsBody = $("#channelList")

function openTuner(device, digital) {
    let options = []
    if (key.length > 0)
        options.push(key)
    if (device)
        options.push(`tuner=${device}`)
    if (digital)
        options.push(`digital=${digital}`)
    $.ajax({
        async: true,
        url: `/channelsList?${options.join('&')}`,
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
function tuneChannel(channel, device, warning) {
    channelsModel.modal('hide');
    let options = []
    if (key.length > 0)
        options.push(key)
    if (device)
        options.push(`tuner=${device}`)
    $.ajax({
        async: true,
        url: `/tuneChannel/${channel}?${options.join('&')}`,
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

function notifyCenter(type, title, sub, message) {
    const header = $("#centerNotify > .toast-header")
    switch (type) {
        case 'success':
            header.attr("class", "toast-header border-0 bg-success text-white")
            break;
        case 'warning':
            header.attr("class", "toast-header border-0 bg-warning text-white")
            break;
        case 'danger':
            header.attr("class", "toast-header border-0 bg-danger text-white")
            break;
        default:
            header.attr("class", "toast-header border-0 bg-black text-white")
            break;
    }
    $("#centerNotify > .toast-header > strong.mr-auto").text(title)
    $("#centerNotify > .toast-header > small").text(sub)
    $("#centerNotify > .toast-body > span").text(message)
    $("#centerNotify").toast('show')
}
