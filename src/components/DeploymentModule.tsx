import React, { useState } from "react";
import { 
  DOCKER_COMPOSE_SPEC, 
  KUBERNETES_MANIFEST, 
  HELM_VALUES, 
  OPENAPI_SPEC, 
  FLUTTER_CODE_STRUCTURE, 
  TV_AGENT_DAEMON, 
  SQL_MIGRATION_SEED, 
  UNIT_TESTS_CODE 
} from "../data";
import { HardDrive, Copy, Check, FileCode, Server, Terminal, Compass, Database, ShieldCheck } from "lucide-react";

export default function DeploymentModule() {
  const [selectedFile, setSelectedFile] = useState<"docker" | "k8s" | "helm" | "openapi" | "flutter" | "daemon" | "sql" | "test">("docker");
  const [copied, setCopied] = useState(false);

  const getFileContent = () => {
    switch (selectedFile) {
      case "docker": return DOCKER_COMPOSE_SPEC;
      case "k8s": return KUBERNETES_MANIFEST;
      case "helm": return HELM_VALUES;
      case "openapi": return OPENAPI_SPEC;
      case "flutter": return FLUTTER_CODE_STRUCTURE;
      case "daemon": return TV_AGENT_DAEMON;
      case "sql": return SQL_MIGRATION_SEED;
      case "test": return UNIT_TESTS_CODE;
    }
  };

  const getFileName = () => {
    switch (selectedFile) {
      case "docker": return "docker-compose.yml";
      case "k8s": return "k8s-deployment.yaml";
      case "helm": return "helm-values.yaml";
      case "openapi": return "openapi-spec.json";
      case "flutter": return "flutter-structure.dart";
      case "daemon": return "aenzbi-tv-agent.py";
      case "sql": return "schema-seed.sql";
      case "test": return "orchestration.test.ts";
    }
  };

  const getFileIcon = () => {
    switch (selectedFile) {
      case "docker": return <Server className="h-4 w-4" />;
      case "k8s": return <Server className="h-4 w-4 text-blue-500" />;
      case "helm": return <Server className="h-4 w-4 text-teal-500" />;
      case "openapi": return <Compass className="h-4 w-4 text-emerald-500" />;
      case "flutter": return <FileCode className="h-4 w-4 text-sky-500" />;
      case "daemon": return <Terminal className="h-4 w-4 text-yellow-500" />;
      case "sql": return <Database className="h-4 w-4 text-indigo-500" />;
      case "test": return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="deployment-manifests-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-indigo-600" />
            Central Repository & Manifests
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review, compile, and export enterprise infrastructure setups and developer assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar for files list */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block px-2 font-mono">Manifests & Codebases</span>
          
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setSelectedFile("docker")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "docker" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Server className="h-4 w-4 text-indigo-100" />
              <span>docker-compose.yml</span>
            </button>

            <button
              onClick={() => setSelectedFile("k8s")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "k8s" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Server className={`h-4 w-4 ${selectedFile === "k8s" ? "text-indigo-100" : "text-blue-500"}`} />
              <span>k8s-deployment.yaml</span>
            </button>

            <button
              onClick={() => setSelectedFile("helm")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "helm" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Server className={`h-4 w-4 ${selectedFile === "helm" ? "text-indigo-100" : "text-teal-500"}`} />
              <span>helm-values.yaml</span>
            </button>

            <button
              onClick={() => setSelectedFile("openapi")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "openapi" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Compass className={`h-4 w-4 ${selectedFile === "openapi" ? "text-indigo-100" : "text-emerald-500"}`} />
              <span>OpenAPI Swagger JSON</span>
            </button>

            <button
              onClick={() => setSelectedFile("flutter")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "flutter" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <FileCode className={`h-4 w-4 ${selectedFile === "flutter" ? "text-indigo-100" : "text-sky-500"}`} />
              <span>Flutter App Structure</span>
            </button>

            <button
              onClick={() => setSelectedFile("daemon")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "daemon" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Terminal className={`h-4 w-4 ${selectedFile === "daemon" ? "text-indigo-100" : "text-yellow-500"}`} />
              <span>Hospitality TV Agent</span>
            </button>

            <button
              onClick={() => setSelectedFile("sql")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "sql" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Database className={`h-4 w-4 ${selectedFile === "sql" ? "text-indigo-100" : "text-indigo-500"}`} />
              <span>Postgres Database Schema</span>
            </button>

            <button
              onClick={() => setSelectedFile("test")}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile === "test" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <ShieldCheck className={`h-4 w-4 ${selectedFile === "test" ? "text-indigo-100" : "text-emerald-500"}`} />
              <span>Bun / Jest Integration Tests</span>
            </button>
          </nav>
        </div>

        {/* Code Viewer Panel */}
        <div className="lg:col-span-3 bg-neutral-950 text-neutral-200 border border-neutral-900 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 font-mono text-gray-300">
                {getFileIcon()}
                <span>{getFileName()}</span>
              </div>

              <button 
                onClick={handleCopy}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>

            <div className="p-4 overflow-auto max-h-[480px]">
              <pre className="font-mono text-xs text-gray-300 leading-relaxed select-all whitespace-pre">
                {getFileContent()}
              </pre>
            </div>
          </div>

          <div className="px-4 py-3 bg-neutral-900 border-t border-neutral-800 text-[10px] text-gray-500 font-mono flex justify-between">
            <span>AENZBI IPTV V1.2.0-LATEST</span>
            <span>PROPRIETARY SPECIFICATIONS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
