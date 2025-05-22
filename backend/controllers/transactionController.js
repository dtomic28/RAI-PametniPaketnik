var TransactionModel = require('../models/transactionModel');	
var UserModel = require('../models/userModel');
var LockboxModel = require('../models/lockboxModel');
var ItemModel = require('../models/itemModel');

module.exports = {
    default: function (req, res) {
        res.json({ message: 'default function in transactionController'});
    },
    getAllCompletedTransactions: async function (req, res) {
        try {
            const transactions = await TransactionModel.find({ finishedSellingTime: { $ne: null } })
                .populate('sellerID')
                .populate('buyerID')
                .populate('itemID')
                .exec();
            res.json(transactions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getAllOpenTransactions: async function (req, res) {
        try {
            const transactions = await TransactionModel.find({ finishedSellingTime: null })
                .populate('sellerID')
                .populate('buyerID')
                .populate('itemID')
                .exec();
            res.json(transactions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getUnwantedTransactions: async function (req, res) {
        try {
            const transactions = await TransactionModel.find({
                finishedSellingTime: null,
                startedSellingTime: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
                .populate('sellerID')
                .populate('buyerID')
                .populate('itemID')
                .exec();
            res.json(transactions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getTransactionByID: async function (req, res) {
        try {
            const transactions = await TransactionModel.find({ lockboxID: req.params.id })
                .populate('sellerID')
                .populate('buyerID')
                .populate('itemID')
                .exec();
            res.json(transactions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}