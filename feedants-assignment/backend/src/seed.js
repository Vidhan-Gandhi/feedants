require("dotenv").config();
const connectDB = require("./config/db");
const Competition = require("./models/Competition");
const Registration = require("./models/Registration");
const Submission = require("./models/Submission");
const User = require("./models/User");

/**
 * Seeds one competition matching the provided design reference, with
 * dates computed relative to "now" so that the screen shows the exact
 * same state described in the design (registration closing soon, 1/20
 * booked, 19 spots left) no matter when you run this script.
 */
async function seed() {
  await connectDB();

  await Promise.all([Competition.deleteMany({}), Registration.deleteMany({}), Submission.deleteMany({})]);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const comp = await Competition.create({
    title: "Feedants Classical Dance",
    tags: ["Dance", "Multi-Win"],
    winnersGetCertificate: true,
    prizePool: 1500,
    entryFee: 99,
    spotsTotal: 20,
    spotsLeft: 19,
    judge: {
      name: "Manju Dubey",
      title: "Professional Kathak Dancer",
      experience: "12+ Years of Experience",
      photoUrl: "https://example.com/judges/manju-dubey.jpg",
      introVideoUrl: "https://example.com/videos/manju-dubey-intro.mp4",
    },
    registrationCloseAt: new Date(now + 1 * day + 6.5 * 60 * 60 * 1000), // ~1d 6h from now
    submissionStartAt: new Date(now + 2 * day),
    submissionEndAt: new Date(now + 10 * day),
    resultDate: new Date(now + 12 * day),
    aboutShort:
      "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.",
    aboutFull:
      "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance. Entries are judged on technique, expression (abhinaya), rhythm, and overall presentation. Submit a single video recording of your performance before the submission deadline; only entries from paid, registered participants are considered for judging.",
    judgingParameters:
      "Technique & form (30%), rhythm & timing (25%), expression / abhinaya (25%), overall presentation & costume (20%). Judge's decision is final.",
    rulesEligibility:
      "Open to all age groups. One submission per registered participant (resubmission allowed until the submission deadline). Performance must be solo and original choreography or a recognised classical piece. Video must be a single unedited take, max 5 minutes.",
    rewards: [
      { position: 1, label: "1st Winner", amount: 550, icon: "trophy" },
      { position: 2, label: "2nd Winner", amount: 300, icon: "medal" },
      { position: 3, label: "3rd Winner", amount: 240, icon: "bronze-medal" },
      { position: 4, label: "4th Winner", amount: 200, icon: "star" },
      { position: 5, label: "5th Winner", amount: 130, icon: "star" },
      { position: 6, label: "6th Winner", amount: 80, icon: "star" },
    ],
    previousWinners: [
      { name: "Riya Shah", position: "1st Winner", photoUrl: "https://example.com/winners/riya-shah.jpg", videoUrl: "https://example.com/videos/riya-shah.mp4" },
      { name: "Aarav Mehta", position: "1st Winner", photoUrl: "https://example.com/winners/aarav-mehta.jpg", videoUrl: "https://example.com/videos/aarav-mehta.mp4" },
      { name: "Neha Verma", position: "2nd Winner", photoUrl: "https://example.com/winners/neha-verma.jpg", videoUrl: "https://example.com/videos/neha-verma.mp4" },
      { name: "Ishita Chopra", position: "3rd Winner", photoUrl: "https://example.com/winners/ishita-chopra.jpg", videoUrl: "https://example.com/videos/ishita-chopra.mp4" },
    ],
    disclaimer: "Only contributions from paid participants will be considered for judging.",
    prizeMoneyVideoUrl: "https://example.com/videos/how-you-receive-prize-money.mp4",
    refundPolicyUrl: "https://feedants.com/refund-policy",
    referralBaseUrl: "https://feedants.com/r",
    referralRewardPerSignup: 10,
  });

  // Seed the one existing registration so spotsLeft (19) matches "1 / 20 Booked".
  const seedUser = await User.create({ name: "Seed Participant", email: "seed.participant@example.com" });
  await Registration.create({ competition: comp._id, user: seedUser._id, registeredAt: new Date(now - day) });

  console.log("Seeded competition:", comp._id.toString());
  console.log("Seed user (already registered):", seedUser._id.toString());
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
