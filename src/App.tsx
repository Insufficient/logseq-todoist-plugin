import React, { useEffect, useState } from "react";
import "./App.css";
import "@logseq/libs";
import { getAllLabels, getAllProjects, removePrefix } from "./helpersTodoist";
import axios from "axios";

export default function App(props: any) {
  const [projects, setProjects] = useState([]) as any[];
  const [labels, setLabels] = useState([]) as any[];
  const [formData, setFormData] = useState({
    project_id: "",
    label_ids: "",
    priority: "",
    due_string: "",
  });

  useEffect(() => {
    (async function () {
      const projectRes = await getAllProjects();
      let mappedProjects = projectRes.map((r: any) => ({
        id: r.id,
        name: r.name,
      }));
      mappedProjects.unshift({ id: "0", name: "-" });

      const labelRes = await getAllLabels();
      let mappedLabels = labelRes.map((r: any) => ({
        id: r.id,
        name: r.name,
      }));
      mappedLabels.unshift({ id: "0", name: "-" });

      setLabels(mappedLabels);
      setProjects(mappedProjects);
    })();
  }, []);

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendTask = async () => {
    const { project_id, label_ids, priority, due_string } = formData;
    let data: any = {};
    if (project_id && project_id !== "0")
      data["project_id"] = parseInt(project_id);
    if (label_ids && label_ids !== "0")
      data["label_ids"] = [parseInt(label_ids)];
    if (priority && priority !== "0") data["priority"] = parseInt(priority);
    if (due_string && due_string !== "") data["due_string"] = due_string;
    if (logseq.settings!.appendLogseqUri) {
      data["content"] = `[${removePrefix(
        props.content
      )}](logseq://graph/logseq?block-id=${props.uuid})`;
    } else {
      data["content"] = removePrefix(props.content);
    }

    const sendResponse = await axios({
      method: "post",
      url: "https://api.todoist.com/rest/v1/tasks",
      data,
      headers: {
        Authorization: `Bearer ${logseq.settings!.apiToken}`,
      },
    });

    if (logseq.settings!.appendTodoistUrl) {
      await logseq.Editor.updateBlock(
        props.uuid,
        `[${props.content}](${sendResponse.data.url})`
      );
    }

    logseq.hideMainUI();
    setFormData({
      project_id: "",
      label_ids: "",
      priority: "",
      due_string: "",
    });
    logseq.App.showMsg(`
         [:div.p-2
           [:h1 "Task (without priority) sent to your Todoist Inbox!"]
           [:h2.text-xl "${props.content}"]]`);
  };

  return (
    <div className="flex justify-center border-black" tabIndex={-1}>
      <div className=" absolute top-10 bg-white rounded-lg p-3 w-1/3 border">
        <div className="mb-6 text-blue-800 font-extrabold text-xl">
          {props.content}
        </div>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/6">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
              Project
            </label>
          </div>
          <div className="md:w-5/6">
            <select
              onChange={handleInput}
              name="project_id"
              value={formData.project_id}
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            >
              {projects.map((p: any) => (
                <option value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/6">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
              Label
            </label>
          </div>
          <div className="md:w-5/6">
            <select
              onChange={handleInput}
              name="label_ids"
              value={formData.label_ids}
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            >
              {labels.map((p: any) => (
                <option value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/6">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
              Priority
            </label>
          </div>
          <div className="md:w-5/6">
            <select
              onChange={handleInput}
              name="priority"
              value={formData.priority}
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            >
              <option value={1}>1 (normal)</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4 (urgent)</option>
            </select>
          </div>
        </div>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/6">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
              Due
            </label>
          </div>
          <div className="md:w-5/6">
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              type="text"
              name="due_string"
              onChange={handleInput}
              value={formData.due_string}
              placeholder="You can use Todoist's Human defined task due date (ex.: 'next Monday', 'Tomorrow'). Value is set using local (not UTC) time."
            />
          </div>
        </div>
        <div className="md:flex md:items-center">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <button
              className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={sendTask}
            >
              Send Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
