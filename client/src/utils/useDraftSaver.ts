import { useState, useEffect } from "react";
import scenario_service from "../services/scenarioService";
import { serialize_scenario_for_api } from "./serialization";
import { useParams } from "react-router-dom";

//definition the return type for this hook
interface DraftSaverResult {
  scenario_id: string | null;
  save_draft: (data: any, is_draft?: boolean) => Promise<void>;
  error: Error | null;
}

//hook for saving scenario drafts
//for both: partial saves and final submission
export const use_draft_saver = (): DraftSaverResult => {
  const { id } = useParams(); // Get the ID from URL if in edit mode
  const [scenario_id, set_scenario_id] = useState<string | null>(() => {
    // Initialize state from URL ID or localStorage
    const saved_id = id || localStorage.getItem('current_editing_scenario_id');
    console.log("Initializing scenario_id from URL/localStorage:", saved_id);
    return saved_id;
  });
  const [error, set_error] = useState<Error | null>(null);

  // Update scenario_id when URL id changes
  useEffect(() => {
    if (id) {
      console.log("URL id changed, updating scenario_id:", id);
      set_scenario_id(id);
      localStorage.setItem('current_editing_scenario_id', id);
    }
  }, [id]);

  //save scenario_id to localStorage whenever it changes
  useEffect(() => {
    console.log("scenario_id changed to:", scenario_id);
    if (scenario_id) {
      console.log("Saving scenario_id to localStorage:", scenario_id);
      localStorage.setItem('current_editing_scenario_id', scenario_id);
    } else {
      console.log("Removing scenario_id from localStorage");
      localStorage.removeItem('current_editing_scenario_id');
    }
  }, [scenario_id]);

  //save current scenario to db:
  //default is draft, if is_draft is false, it is final submission
  //ai generated console.logs:
  //promt: please write the console log statements for monitoring final step of saving draft
  const save_draft = async (data: any, is_draft: boolean = true) => {
    set_error(null);

    try {
      console.log("============== Attempting to Save Draft ==============");
      console.log("Is Draft parameter:", is_draft);
      console.log("Data before serialization:", data);
      console.log("Current Scenario ID:", scenario_id);

      //serialize Sets to arrays before saving
      const serialized_data = serialize_scenario_for_api(data);
      console.log("Serialized data:", serialized_data);

      //create the final data object by merging original data with serialized fields
      const final_data = {
        isDraft: is_draft,
        ...data,
        ...serialized_data
      };
      console.log("Final data being sent to server:", final_data);
      console.log("Final is_draft value:", final_data.isDraft);

      // Always use the URL id if available, otherwise use localStorage id
      const current_id = id || localStorage.getItem('current_editing_scenario_id');

      if (!current_id) {
        //no draft exists, create new draft
        console.log("No scenario_id found, creating new draft...");
        const response = await scenario_service.create_scenario(final_data);
        console.log("New draft created successfully:", response);
        
        //extract the ID from the nested data field
        const new_scenario_id = response.data?._id;
        console.log("Extracted new scenario_id:", new_scenario_id);
        
        if (new_scenario_id) {
          console.log("Setting new scenario_id:", new_scenario_id);
          set_scenario_id(new_scenario_id);
          localStorage.setItem('current_editing_scenario_id', new_scenario_id);
        } else {
          console.error("No _id found in response data:", response);
          throw new Error("Failed to create scenario: No ID returned");
        }
      } else {
        console.log("Updating existing draft with ID:", current_id);
        try {
          const updated_draft = await scenario_service.update_scenario(current_id, final_data);
          console.log("Draft updated successfully:", updated_draft);
          console.log("Updated draft is_draft value:", updated_draft.data?.isDraft);
          
          //ensure we're using the correct ID
          if (current_id !== scenario_id) {
            set_scenario_id(current_id);
          }
        } catch (err: any) {
          //if we get a 404, the scenario doesn't exist, so create a new one
          if (err.response?.status === 404) {
            console.log("scenario not found, creating new draft");
            const response = await scenario_service.create_scenario(final_data);
            console.log("new draft created successfully:", response);
            
            const new_scenario_id = response.data?._id;
            console.log("extracted new scenario_id:", new_scenario_id);
            
            if (new_scenario_id) {
              console.log("setting new scenario_id:", new_scenario_id);
              set_scenario_id(new_scenario_id);
              localStorage.setItem('current_editing_scenario_id', new_scenario_id);
            } else {
              console.error("no _id found in response data:", response);
              throw new Error("failed to create scenario: No ID returned");
            }
          } else {
            throw err;
          }
        }
      }
      console.log("============ Draft Save Complete ============");
    } catch (err) {
      console.error("error saving draft :", err);
      set_error(err as Error);
      throw err;
    }
  };

  return {
    scenario_id,
    save_draft,
    error
  };
};

export default use_draft_saver; 