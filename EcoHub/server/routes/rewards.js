const express = require('express');
const router = express.Router();
const { RewardsType, Rewards, RewardClaims, RewardCategory, RewardCategoryAssignments} = require('../models');
const { Op, where } = require("sequelize");
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');
const { now } = require('sequelize/lib/utils');

router.post('/add', async (req, res) => {
    const { reward_name, rewards_type_id, reward_quantity, reward_duration, reward_description } = req.body;
  
    if (!reward_name || !rewards_type_id || !reward_quantity || !reward_duration || !reward_description) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const newReward = await Rewards.create({
        
        reward_name,
        rewards_type_id,
        reward_quantity,
        reward_duration,
        reward_description
      });
  
      res.status(201).json(newReward);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get("/", async (req, res) => {
    let currentrewards = await Rewards.findAll(
        {
            include: [{
                model: RewardsType, as: "rewardsType", attributes: ['rewards_type_description'] // Select only the columns you need
            }]
        }
    )
    res.json({currentrewards});

});

router.delete('/delete', async (req, res) => {
    const { id } = req.body; // Extract id from request body
  
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
  
    try {
      // Delete the reward where id matches the provided id
      const deleted = await Rewards.destroy({
        where: { reward_id: id }
      });
  
      if (deleted) {
        res.status(200).json({ message: 'Reward deleted successfully' });
      } else {
        res.status(404).json({ error: 'Reward not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.post("/filtered", async(req, res) =>
    {
        const { requestBody_type } = req.body; // Extract condition from request body 
    
        if (!requestBody_type) {
          return res.status(400).json({ error: 'type_id is required' });
        }

        try {
            const rewardType = await RewardsType.findOne({
                where: {rewards_type_description: requestBody_type}
            })

            // Fetch rewards where type_id matches the given condition
            const selected_rewards = await Rewards.findAll({
              where: {rewards_type_id: rewardType.rewards_type_id}
            });
        
            res.json({ selected_rewards });
          } catch (error) {
            res.status(500).json({ error: error.message });
            console.log("secondary error");
          }
    }
);

router.get("/details/:id", async(req, res) =>{
    const { id } = req.params;
    let targetRewards =await Rewards.findAll({
        where:{reward_id: id},
        include: [{
          model: RewardsType, as: "rewardsType", attributes: ['rewards_type_description'] // Select only the columns you need
      }]
    });
    res.json({targetRewards});
})

//Upddate feature, current dilema, to have both display and update in one feature or to have details/:id for the display of details and to have update act similarly to the add function, one possible implemntation of the the former method that is suggested is to have the api endpoint detect if it is recieving a null request body, if it is null then it will simply respond with the details, then it can be called again with the details filled and updated the targeted object or a different method...TBC
router.post("update/:id", async(req, res) =>{
    const { id } = req.params;
    const { reward_name, rewards_type_id, reward_quantity, reward_duration, reward_description } = req.body;

    let tbupdated = await Rewards.findAll({
      where: {reward_id: id}
    })
    await tbupdated.update({
      reward_name: reward_name,
      rewards_type_id: rewards_type_id,
      reward_quantity: reward_quantity,
      reward_duration: reward_duration,
      reward_description: reward_description

    });
    await tbupdated.save();
  
})

//Addition of the rewards types

//implementation of points system, how should it be done

router.get("/rewardtypes", async (req, res) => {
    let rewardtypes = await RewardsType.findAll()
    res.json({rewardtypes})
});

router.post("/addtypes", async(req, res) => {
  const { rewards_type_description } = req.body
  
  try{
    const newType = await RewardsType.create(
      {
        rewards_type_description:rewards_type_description
      }
    )
    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


//Addition of rewards category/tags can be used for filtering and searching
router.post("/addcategory", async(req, res) => {
  const {reward_id, category_id} = req.body;

  try {

    const assigncategory = await RewardCategoryAssignments.create({
      cat_id: category_id,
      reward_id: reward_id
    })
    res.json(assigncategory)
  }catch(error){
    res.status(500).json({ error: error.message });
  }

})

router.get("viewtags/:id", async(req, res) => {
  const { id } = req.params;
  let rewardtags = await RewardCategoryAssignments.findAll({
    where:{reward_id: id}
  });
  res.json(rewardtags);
})

//Claiming of reward / adding reward to account
router.post("/claimreward", async(req, res) => {
  
  const { userId, reward_id } = req.body;

  try{
    const claimReward = await RewardClaims.create({
      reward_id: reward_id,
      user_id: userId,
      claimDate: new Date()
    });
    res.json(claimReward);
  } catch(error){
    res.status(500).json({ error: error.message });
  }
})

router.get("/viewclaimedrewards/:user_id", async(req, res) => {
  const { user_id } = req.params;
  let claimedRewards = await RewardClaims.findAll({
    where: {user_id: user_id},
    include:[
      {
        model: Rewards,
        as: 'rewards',
        attributes:['reward_id', 'reward_name', 'rewards_type_id', 'reward_quantity', 'reward_duration', 'reward_description']
      }
    ]
  });
  res.json(claimedRewards);
})


//add delete, update, for type and reward, but maybe add post for it as well

module.exports = router;