import { adminJobsService as firestoreAdminJobsService, type Job, type JobApplication, type JobStatus } from './jobsService';

export type { Job, JobApplication, JobStatus };

export const adminJobsService = {
  getJobs(status?: JobStatus) {
    return firestoreAdminJobsService.getJobs(status);
  },
  updateStatus(jobId: string, status: JobStatus, rejectionReason = '') {
    return firestoreAdminJobsService.updateStatus(jobId, status, rejectionReason);
  },
  getApplications(jobId: string) {
    return firestoreAdminJobsService.getApplications(jobId);
  },
  updateApplicationStatus(jobId: string, applicationId: string, status: JobApplication['status']) {
    return firestoreAdminJobsService.updateApplicationStatus(jobId, applicationId, status);
  },
};
