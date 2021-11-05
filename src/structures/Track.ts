import { SourceProviders } from "../utils/constants";

class Track {
    public source: SourceProviders;
    public title: string;
    public description?: string;
    public url: string;
    public identifier: string;
    public raw_duration: number;
    public duration: string;
    public thumbnail: string;
    public author: string;
    public authorURL: string;
}