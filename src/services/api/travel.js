import request from "../request";

export default {
  getTravelList: (params) => request.get("/api/traveldiaries", { params }),
  getTravelDetail: (id) => request.get(`/api/traveldiaries/${id}`),
  getMyTravelList: (userId) =>
    request.get(`/api/traveldiaries/users/${userId}/traveldiaries`),
  createTravel: (data) => request.post("/api/traveldiaries", data),
  updateTravel: (id, data) => request.put(`/api/traveldiaries/${id}`, data),
  deleteTravel: (id) => request.delete(`/api/traveldiaries/${id}`),
  toggleLike: (id) => request.post(`/api/traveldiaries/${id}/like`),
  checkLikeStatus: (id) => request.get(`/api/traveldiaries/${id}/like`),
};
