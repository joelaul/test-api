require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} = require("graphql");

const PORT = process.env.PORT || 8000;

// #######################################
//               CONNECT DB
// #######################################

// launch database + allow use of relevant db models in gql resolvers

const mongoose = require("mongoose");
const Entry = require("./models/Entry");

mongoose.set("strictQuery", true);
const connect = async () => {
  // connect to TattleLog.entries collection
  await mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
  });
};
connect();

// #######################################
//               CONNECT GQL
// #######################################

// resolvers need only be provided at root level; gql navigates from there
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "root query",
  fields: () => ({
    entry: {
      type: EntryType,
      description: "one tattle log entry",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) =>
        await Entry.findOne({ id: args.id }).exec(),
    },
    entries: {
      type: new GraphQLList(EntryType),
      description: "a list of all tattle log entries",
      resolve: async () => await Entry.find().sort({ id: 1 }),
    },
  }),
});

const EntryType = new GraphQLObjectType({
  name: "Entry",
  description: "one tattle log entry",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    image: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    stats: { type: new GraphQLNonNull(StatsType) },
  }),
});

const StatsType = new GraphQLObjectType({
  name: "Stats",
  description: "contains a tattle log entry's stats",
  fields: () => ({
    atk: { type: new GraphQLNonNull(GraphQLInt) },
    def: { type: new GraphQLNonNull(GraphQLInt) },
    hp: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

// #######################################
//               MIDDLEWARE
// #######################################

app.use(logger);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// #######################################
//                ROUTES
// #######################################

// serve static files
app.use(express.static(path.join(__dirname, "/client")));
app.use("/", require("./routes/root"));

// REST API - Entries
app.use("/api/entries", require("./routes/entry"));

// GQL API - Entries
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

// 404 any other endpoint
app.get("/*", (req, res) => {
  res
    .status(404)
    .sendFile(path.join(__dirname, "client", "public", "404.html"));
});

app.use(errorHandler);

// #######################################
// ONLY RUN SERVER IF CONNECTED TO MONGODB
// #######################################

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () =>
    console.log(
      `Server running on port ${PORT}\n-------------------------------------------------------`
    )
  );
});
