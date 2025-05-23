const axios = require('axios');

module.exports = {
    default: function (req, res) {
        res.json({ message: 'default function in tokenController' });
    },

    requestToken: async function (req, res) {
        console.log("Request Token");   
        const { username, password, id } = req.body;

        const payload = {
            deliveryId: 12345,
            boxId: req.params.BoxID,
            tokenFormat: 4,
            latitude: 46.056946,
            longitude: 14.505751,
            qrCodeInfo: null,
            terminalSeed: 111222,
            isMultibox: false,
            doorIndex: 0,
            addAccessLog: true
        };
        try {
            const response = await axios.post("https://api-d4me-stage.direct4.me/sandbox/v1/Access/openbox", payload, {
                headers: {
                    'Authorization': `Bearer 9ea96945-3a37-4638-a5d4-22e89fbc998f`,
                    'Content-Type': 'application/json'
                }
            });
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}