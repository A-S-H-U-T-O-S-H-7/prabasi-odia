import { adminJobsService as firestoreAdminJobsService, type Job, type JobApplication, type JobStatus } from './jobsService';

export type { Job, JobApplication, JobStatus };

export const adminJobsService = {
  getJobs(status?: JobStatus) {
    return firestoreAdminJobsService.getJobs(status);
  },
  updateStatus(jobId: string, status: JobStatus, rejectionReason = '') {
    return firestoreAdminJobsService.updateStatus(jobId, status, rejectionReason);
  },
  updateJob(jobId: string, data: Pick<Job, 'title' | 'company' | 'category' | 'location' | 'description' | 'compensation' | 'contactName' | 'contactEmail'>) {
    return firestoreAdminJobsService.updateJob(jobId, data);
  },
  deleteJob(jobId: string) {
    return firestoreAdminJobsService.deleteJob(jobId);
  },
  getApplications(jobId: string) {
    return firestoreAdminJobsService.getApplications(jobId);
  },
  updateApplicationStatus(jobId: string, applicationId: string, status: JobApplication['status']) {
    return firestoreAdminJobsService.updateApplicationStatus(jobId, applicationId, status);
  },
};
