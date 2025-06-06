"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const dotenv = __importStar(require("dotenv"));
// import cors from "cors";
const fetch_coda_tables_tool_js_1 = require("./tools/fetch-coda-tables.tool.js");
const fetch_coda_table_tool_js_1 = require("./tools/fetch-coda-table.tool.js");
const fetch_coda_table_columns_tool_js_1 = require("./tools/fetch-coda-table-columns.tool.js");
const fetch_coda_column_tool_js_1 = require("./tools/fetch-coda-column.tool.js");
const fetch_coda_rows_tool_js_1 = require("./tools/fetch-coda-rows.tool.js");
const upsert_coda_rows_tool_js_1 = require("./tools/upsert-coda-rows.tool.js");
const delete_coda_rows_tool_js_1 = require("./tools/delete-coda-rows.tool.js");
const fetch_coda_docs_tool_js_1 = require("./tools/fetch-coda-docs.tool.js");
// Load environment variables
dotenv.config();
const server = new mcp_js_1.McpServer({
    name: "mcp-coda",
    version: "1.0.0",
});
// Register tools
(0, fetch_coda_tables_tool_js_1.registerFetchCodaTablesTools)(server);
(0, fetch_coda_table_tool_js_1.registerFetchCodaTableTool)(server);
(0, fetch_coda_table_columns_tool_js_1.registerFetchCodaTableColumnsTools)(server);
(0, fetch_coda_column_tool_js_1.registerFetchCodaColumnTool)(server);
(0, fetch_coda_rows_tool_js_1.registerFetchCodaRowsTool)(server);
(0, upsert_coda_rows_tool_js_1.registerUpsertCodaRowsTool)(server);
(0, delete_coda_rows_tool_js_1.registerDeleteCodaRowsTool)(server);
(0, fetch_coda_docs_tool_js_1.registerFetchCodaDocsTool)(server);
const app = (0, express_1.default)();
// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};
app.get("/sse", async (_, res) => {
    const transport = new sse_js_1.SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
        delete transports[transport.sessionId];
    });
    console.log(`New SSE connection established, sessionId: ${transport.sessionId}`);
    await server.connect(transport);
});
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    }
    else {
        res.status(400).send("No transport found for sessionId");
    }
});
const PORT = parseInt(process.env.PORT || "8000", 10);
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
    console.log(`MCP server running at http://${HOST}:${PORT}`);
    console.log("Available endpoints:");
    console.log(`- GET  /sse       - SSE connection endpoint`);
    console.log(`- POST /messages  - Message handling endpoint`);
});
