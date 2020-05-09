const mongoCollections = require('../config/mongoCollections');
const issues = mongoCollections.issues;
const usersCol = mongoCollections.users;
const users = require('./users');
const { ObjectId } = require('mongodb');
//const uuid = require('uuid');

let exportedMethods = {
    async getAllIssues() {
        const issueCollection = await issues();
        const issueList = await issueCollection.find({}).sort({ date: -1 }).toArray();
        return issueList;
    },
    async getIssuesByUserId(userID) {
        const issues = users.getUserById(userID).issues;
        const issueCollection = await issues();
        for (let issue of issues) {
            issue = this.getIssueById(issue);
        }
        if (!issueList) throw 'User has no issues!';
        return issueList;
    },
    async getIssueById(id) {
        id = ObjectId(id);
        const issueCollection = await issues();
        const issue = await issueCollection.findOne({ _id: id });
        return issue;
    },
    async addIssue(name, category, date, latitude, longitude, city, state, userID) { // user
        if (!name) throw 'Issue name missing.';
        if (!category) throw 'Category missing.';
        if (!date) throw 'Date missing.';
        if (!latitude) throw 'Latitude missing.';
        if (!longitude) throw 'Longitude missing.';
        if (!city) throw 'City missing.';
        if (!state) throw 'State missing.';
        if (!userID) throw 'User ID missing.';

        const issueCollection = await issues();
        const userCollection = await usersCol();
        const user = await userCollection.findOne({ email: userID }); //user
        let newIssue = {
            name: name,
            category: category,
            date: date,
            likes: 0,
            latitude: latitude,
            longitude: longitude,
            city: city,
            state: state,
            status: "open",
            userID: user._id,
            comments: []
        };
        const issueInfo = await issueCollection.insertOne(newIssue);
        if (issueInfo.insertedCount === 0) throw 'Could not add issue';
        const id = issueInfo.insertedId;
        await users.addIssueToUser(user._id, newIssue)
        const issue = await this.getIssueById(id);
        return issue;
    },
    async getIssuesByCategory(category) {
        const issueCollection = await issues();
        const issueList = await issueCollection.find({ category: category })
            .sort({ date: -1 }).toArray();
        return issueList;
    },
    async getIssuesByCity(city) {
        const issueCollection = await issues();
        const issueList = await issueCollection.find({ city: city })
            .sort({ date: -1 }).toArray();
        return issueList;
    },
    async getIssuesByState(state) {
        const issueCollection = await issues();
        const issueList = await issueCollection.find({ state: state })
            .sort({ date: -1 }).toArray();
        return issueList;
    },
    async getIssuesByStatus(status) {
        const issueCollection = await issues();
        const issueList = await issueCollection.find({ status: status })
            .sort({ date: -1 }).toArray();
        return issueList;
    },
    async removeIssue(id) {
        if (!id) throw 'Issue ID missing';
        const issueCollection = await issues();

        const issue = await this.getIssueById(id);
        const deletionInfo = await issueCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
            throw "Could not delete issue";
        }
        return true;
    },

    // DElete all the issues related to a specific user!
    async removeAllIssue(id) {
        if (!id) throw 'Issue ID missing';
        const issueCollection = await issues();

        //const issue = await this.getIssueById(id);
        const deletionInfo = await issueCollection.remove({ userID: id }); // This will remove all the issues related to a specific USER when he deletes the account in issue collection
        if (deletionInfo.deletedCount === 0) {
            console.log("deleted all the issues");
            return true
            //throw "Could not delete issue";
        }
        return true;
    },
    // },
    // async closeIssue(id) {
    //
    // },
    // async openIssue(id) {
    //
    // },
    // async updateIssue(id) {
    //
    // },
    // async addComment(name, comment) {


    async getAllComments(issueId) {
        const issue = await this.getIssueById(issueId);
        return issue.comments;
    },
    async addComment(name, content, issueId) {
        const issueCollection = await issues();

        const comment = {
            _id: uuid.v4(),
            name: name,
            content: content
        };

        issueId = ObjectId(issueId);

        const updatedInfo = await issueCollection.updateOne({ _id: issueId }, { $addToSet: { comments: comment } });
        if (updatedInfo.modifiedCount === 0) {
            throw 'Could not add comment.';
        }

        return comment;
    }
};

module.exports = exportedMethods;
