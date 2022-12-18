import AxiosHelper from "utils/axios";

export const updateProject = (formData, draftUpdateMeta) => {
    Promise.all([
        AxiosHelper.updateCachedDraftTitle(
            draftUpdateMeta.indexUserID,
            draftUpdateMeta.projectID,
            draftUpdateMeta.title
        ), 
        AxiosHelper.updateProject(formData)])
        // .then
        // .then((result) => AxiosHelper.updateProject(formData))
        .then((result => {
            alert("success!");
            window.location.reload();
        }));
}