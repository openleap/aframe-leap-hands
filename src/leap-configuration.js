module.exports = {
    schema: {
        hmd: {
            type: 'boolean',
            default: true
        }
    },

    init: function () {
        this.SetHMDMode(this.data.hmd);
    },

    update: function (oldData) {
        oldData = oldData || {};
        if (this.data.hmd != oldData.hmd) {
            this.SetHMDMode(this.data.hmd);
        }
    },

    SetHMDMode(useHMD) {
        this.el.systems.leap.useHMDMode(useHMD);
    }
}
