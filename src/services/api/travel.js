import request from "../request";

export default {
  getTravelList: (params) => request.get("/api/travels", { params }),
  getTravelDetail: (id) => request.get(`/api/travels/${id}`),
  getMyTravelList: (userId) =>
    request.get(`/api/travels/users/${userId}/traveldiaries`),
  createTravel: (data) => request.post("/api/travels", data),
  updateTravel: (id, data) => request.put(`/api/travels/${id}`, data),
  deleteTravel: (id) => request.delete(`/api/travels/${id}`),
};
