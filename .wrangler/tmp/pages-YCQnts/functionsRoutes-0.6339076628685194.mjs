import { onRequestPost as __api_auth_ts_onRequestPost } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\api\\auth.ts"
import { onRequestPost as __api_data_ts_onRequestPost } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\api\\data.ts"
import { onRequestPost as __api_kv_session_ts_onRequestPost } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\api\\kv-session.ts"
import { onRequestPost as __api_settings_ts_onRequestPost } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\api\\settings.ts"
import { onRequestPost as __api_templates_ts_onRequestPost } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\api\\templates.ts"
import { onRequestOptions as ___middleware_ts_onRequestOptions } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\_middleware.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\corin\\Documents\\b\\app\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_ts_onRequestPost],
    },
  {
      routePath: "/api/data",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_data_ts_onRequestPost],
    },
  {
      routePath: "/api/kv-session",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_kv_session_ts_onRequestPost],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_settings_ts_onRequestPost],
    },
  {
      routePath: "/api/templates",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_templates_ts_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [___middleware_ts_onRequestOptions],
      modules: [],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]