import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Building2, Users, Mail, Phone, Link as LinkIcon, UserCircle, QrCode, Paperclip, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  averagesPerCompetency,
  getAllRows,
  groupByEvent,
  loadCapacity,
  type EventCapacity,
} from "@/lib/capacity";

export interface Meeting {
  id: string;
  activityId: string;
  subActivityId: string;
  quarter: string;
  meetingDate: string;
  focusArea: string;
  implementingEntities: string[];
  deliveryPartners: string[];
  keyObjectives: string;
  format: "Virtual" | "Hybrid" | "In-Person";
  links?: string;
  organiserName?: string;
  organiserEmail?: string;
  organiserPhone?: string;
  preSurveyLink?: string;
  postSurveyLink?: string;
  preSurveyQrCode?: string;
  postSurveyQrCode?: string;
  attachments?: string;
}

interface MeetingDetailsDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeetingDetailsDialog = ({ meeting, open, onOpenChange }: MeetingDetailsDialogProps) => {
  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{meeting.focusArea}</DialogTitle>
              <DialogDescription className="mt-2">
                {meeting.quarter}
              </DialogDescription>
            </div>
            <Badge variant={meeting.format === "Virtual" ? "secondary" : meeting.format === "Hybrid" ? "outline" : "default"}>
              {meeting.format}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Activity ID:</span>
              <p>{meeting.activityId || "—"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Sub-Activity ID:</span>
              <p>{meeting.subActivityId || "—"}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Meeting Date:</span>
            <span>
              {new Date(meeting.meetingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">Key Objectives</p>
                <p className="text-sm text-muted-foreground">{meeting.keyObjectives}</p>
              </div>
            </div>
          </div>

          {meeting.links && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <LinkIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">Links</p>
                    <div className="space-y-1">
                      {meeting.links.split('\n').filter(Boolean).map((url, idx) => (
                        <a
                          key={idx}
                          href={url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary hover:underline truncate"
                        >
                          {url.trim()}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {(meeting.organiserName || meeting.organiserEmail || meeting.organiserPhone) && (
            <>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">Organiser Contact</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {meeting.organiserName && <p>{meeting.organiserName}</p>}
                      {meeting.organiserEmail && (
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${meeting.organiserEmail}`} className="text-primary hover:underline">
                            {meeting.organiserEmail}
                          </a>
                        </p>
                      )}
                      {meeting.organiserPhone && (
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {meeting.organiserPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

        {(meeting.preSurveyLink || meeting.postSurveyLink) && (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <LinkIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-3">Survey Links</p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {meeting.preSurveyLink && (
                        <a
                          href={meeting.preSurveyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Open Pre-Survey
                        </a>
                      )}
                      {meeting.postSurveyLink && (
                        <a
                          href={meeting.postSurveyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Open Post-Survey
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {meeting.preSurveyLink && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm text-foreground">Pre-Survey QR Code</p>
                          <div className="flex flex-col items-center gap-2">
                            {meeting.preSurveyQrCode ? (
                              <img src={meeting.preSurveyQrCode} alt="Pre-Survey QR Code" className="w-40 h-40 object-contain rounded border bg-white p-1" />
                            ) : (
                              <div className="bg-white p-3 rounded border">
                                <QRCodeSVG value={meeting.preSurveyLink} size={140} />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Scan to open pre-survey</p>
                          </div>
                        </div>
                      )}
                      {meeting.postSurveyLink && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm text-foreground">Post-Survey QR Code</p>
                          <div className="flex flex-col items-center gap-2">
                            {meeting.postSurveyQrCode ? (
                              <img src={meeting.postSurveyQrCode} alt="Post-Survey QR Code" className="w-40 h-40 object-contain rounded border bg-white p-1" />
                            ) : (
                              <div className="bg-white p-3 rounded border">
                                <QRCodeSVG value={meeting.postSurveyLink} size={140} />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Scan to open post-survey</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {meeting.attachments && meeting.attachments.trim() && (
            <>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Paperclip className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">Attachments</p>
                    <ul className="space-y-1">
                      {meeting.attachments.split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
                        const [labelOrUrl, maybeUrl] = line.split('|').map(s => s.trim());
                        const url = maybeUrl || labelOrUrl;
                        const label = maybeUrl ? labelOrUrl : labelOrUrl;
                        return (
                          <li key={idx}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
                              <LinkIcon className="h-3 w-3" />
                              {label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}
          {(meeting.competencies?.filter(Boolean).length ?? 0) > 0 && (
            <>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">Capacity Outcomes</p>
                    {(() => {
                      const comps = (meeting.competencies ?? []).filter(Boolean);
                      const assessments = meeting.capacityAssessments ?? [];
                      const averages = comps.map((c) => {
                        const pres = assessments.map(a => a.preScores[c]).filter((v): v is number => v != null);
                        const posts = assessments.map(a => a.postScores[c]).filter((v): v is number => v != null);
                        const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
                        const pre = avg(pres);
                        const post = avg(posts);
                        return { c, pre, post, change: pre != null && post != null ? post - pre : null };
                      });
                      return (
                        <>
                          <div className="overflow-x-auto mb-3">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-muted-foreground">
                                  <th className="text-left font-medium pb-1">Competency</th>
                                  <th className="text-right font-medium pb-1">Avg before</th>
                                  <th className="text-right font-medium pb-1">Avg after</th>
                                  <th className="text-right font-medium pb-1">Change</th>
                                </tr>
                              </thead>
                              <tbody>
                                {averages.map(({ c, pre, post, change }) => (
                                  <tr key={c} className="border-t">
                                    <td className="py-1.5">{c}</td>
                                    <td className="py-1.5 text-right">{pre?.toFixed(2) ?? "—"}</td>
                                    <td className="py-1.5 text-right">{post?.toFixed(2) ?? "—"}</td>
                                    <td className={`py-1.5 text-right font-medium ${
                                      change == null ? "text-muted-foreground" : change > 0 ? "text-primary" : change < 0 ? "text-destructive" : ""
                                    }`}>
                                      {change == null ? "—" : change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {assessments.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No participants assessed yet.</p>
                          ) : (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Show {assessments.length} participant{assessments.length === 1 ? "" : "s"}
                              </summary>
                              <div className="mt-2 space-y-2">
                                {assessments.map((a) => (
                                  <div key={a.id} className="border rounded p-2">
                                    <p className="font-medium mb-1">{a.participantName || "(unnamed)"}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {comps.map((c) => {
                                        const pre = a.preScores[c];
                                        const post = a.postScores[c];
                                        const d = pre != null && post != null ? post - pre : null;
                                        return (
                                          <Badge key={c} variant="outline" className="text-[10px] font-normal">
                                            {c}: {pre ?? "—"} → {post ?? "—"}
                                            {d != null && <span className={d > 0 ? "ml-1 text-primary" : d < 0 ? "ml-1 text-destructive" : "ml-1"}>({d > 0 ? `+${d}` : d})</span>}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">Implementing Entities</p>
                <div className="flex flex-wrap gap-2">
                  {meeting.implementingEntities.map((entity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">Delivery Partners</p>
                <div className="flex flex-wrap gap-2">
                  {meeting.deliveryPartners.map((partner, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};