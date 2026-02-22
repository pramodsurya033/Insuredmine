const { Worker } = require('worker_threads');
const path = require('path');
const Agent = require('../models/Agent');
const User = require('../models/User');
const UserAccount = require('../models/UserAccount');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');
const Policy = require('../models/Policy');

class FileUploadService {
  static async processCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, '../workers/csvProcessor.js');
      const worker = new Worker(workerPath);

      worker.on('message', async (message) => {
        if (message.status === 'error') {
          reject(new Error(message.error));
        } else {
          try {
            const result = await this.saveDataToDB(message.data);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            worker.terminate();
          }
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      worker.postMessage({ filePath });
    });
  }

  static async saveDataToDB(records) {
    try {
      const agents = new Set();
      const users = new Map();
      const accounts = new Map();
      const lobs = new Set();
      const carriers = new Set();
      const policies = [];

      // Group unique records
      for (const record of records) {
        agents.add(record.agent);
        lobs.add(record.category_name);
        carriers.add(record.company_name);

        const userKey = record.email;
        if (!users.has(userKey)) {
          users.set(userKey, {
            firstname: record.firstname,
            dob: record.dob ? new Date(record.dob) : null,
            address: record.address,
            phone: record.phone,
            state: record.state,
            zip: record.zip,
            email: record.email,
            gender: record.gender,
            userType: record.userType
          });
        }

        const accountKey = record.account_name;
        if (!accounts.has(accountKey)) {
          accounts.set(accountKey, {
            account_name: record.account_name,
            account_type: record.account_type
          });
        }

        policies.push({
          policy_number: record.policy_number,
          policy_start_date: record.policy_start_date ? new Date(record.policy_start_date) : null,
          policy_end_date: record.policy_end_date ? new Date(record.policy_end_date) : null,
          premium_amount: parseFloat(record.premium_amount) || 0,
          policy_type: record.policy_type,
          email: record.email,
          company_name: record.company_name,
          category_name: record.category_name,
          account_name: record.account_name
        });
      }

      // Save Agents
      const agentMap = new Map();
      for (const agent of agents) {
        try {
          let agentDoc = await Agent.findOne({ agent_name: agent });
          if (!agentDoc) {
            agentDoc = await Agent.create({ agent_name: agent });
          }
          agentMap.set(agent, agentDoc._id);
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.error('Error saving agent:', error.message);
          }
        }
      }

      // Save LOBs
      const lobMap = new Map();
      for (const lob of lobs) {
        try {
          let lobDoc = await LOB.findOne({ category_name: lob });
          if (!lobDoc) {
            lobDoc = await LOB.create({ category_name: lob });
          }
          lobMap.set(lob, lobDoc._id);
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.error('Error saving LOB:', error.message);
          }
        }
      }

      // Save Carriers
      const carrierMap = new Map();
      for (const carrier of carriers) {
        try {
          let carrierDoc = await Carrier.findOne({ company_name: carrier });
          if (!carrierDoc) {
            carrierDoc = await Carrier.create({ company_name: carrier });
          }
          carrierMap.set(carrier, carrierDoc._id);
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.error('Error saving carrier:', error.message);
          }
        }
      }

      // Save Users
      const userMap = new Map();
      for (const [email, userData] of users) {
        try {
          let userDoc = await User.findOne({ email });
          if (!userDoc) {
            userDoc = await User.create(userData);
          }
          userMap.set(email, userDoc._id);
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.error('Error saving user:', error.message);
          }
        }
      }

      // Save User Accounts
      for (const [accountName, accountData] of accounts) {
        try {
          const accountExists = await UserAccount.findOne({ account_name: accountName });
          if (!accountExists) {
            // Find first user to associate with account
            const firstUser = Array.from(userMap.values())[0];
            if (firstUser) {
              await UserAccount.create({
                ...accountData,
                user_id: firstUser
              });
            }
          }
        } catch (error) {
          console.error('Error saving user account:', error.message);
        }
      }

      // Save Policies
      let policiesCreated = 0;
      for (const policy of policies) {
        try {
          const policyExists = await Policy.findOne({ policy_number: policy.policy_number });
          if (!policyExists && userMap.has(policy.email)) {
            await Policy.create({
              policy_number: policy.policy_number,
              policy_start_date: policy.policy_start_date,
              policy_end_date: policy.policy_end_date,
              premium_amount: policy.premium_amount,
              policy_type: policy.policy_type,
              user_id: userMap.get(policy.email),
              company_id: carrierMap.get(policy.company_name),
              category_id: lobMap.get(policy.category_name)
            });
            policiesCreated++;
          }
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.error('Error saving policy:', error.message);
          }
        }
      }

      return {
        success: true,
        message: 'Data imported successfully',
        summary: {
          agents: agentMap.size,
          users: userMap.size,
          lobs: lobMap.size,
          carriers: carrierMap.size,
          policies: policiesCreated,
          totalRecords: records.length
        }
      };
    } catch (error) {
      throw new Error(`Error saving data to database: ${error.message}`);
    }
  }
}

module.exports = FileUploadService;
