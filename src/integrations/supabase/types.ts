export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          answer_text: string | null
          created_at: string
          id: string
          is_correct: boolean | null
          questions_id: string | null
          sequence_order: number | null
        }
        Insert: {
          answer_text?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          questions_id?: string | null
          sequence_order?: number | null
        }
        Update: {
          answer_text?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          questions_id?: string | null
          sequence_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_questions_id_fkey"
            columns: ["questions_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lecture_id: string | null
          max_points: number | null
          title: string | null
          update_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lecture_id?: string | null
          max_points?: number | null
          title?: string | null
          update_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lecture_id?: string | null
          max_points?: number | null
          title?: string | null
          update_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          category_id: number
          description: string | null
          name: string
          parent_category_id: number | null
        }
        Insert: {
          category_id?: never
          description?: string | null
          name: string
          parent_category_id?: number | null
        }
        Update: {
          category_id?: never
          description?: string | null
          name?: string
          parent_category_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string
          completion_date: string | null
          course_id: string | null
          created_at: string
          id: string
          issued_by: string | null
          user_id: string | null
          verification_code: string | null
        }
        Insert: {
          certificate_url: string
          completion_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          issued_by?: string | null
          user_id?: string | null
          verification_code?: string | null
        }
        Update: {
          certificate_url?: string
          completion_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          issued_by?: string | null
          user_id?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courseCategories: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          level: string | null
          long_description: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          level?: string | null
          long_description?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          level?: string | null
          long_description?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          content: string
          created_at: string | null
          discussion_id: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          parent_id: string | null
          posted_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          discussion_id?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          posted_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          discussion_id?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          posted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussionPosts: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_edited: boolean | null
          posted_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          posted_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          posted_at?: string | null
        }
        Relationships: []
      }
      discussions: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_closed: boolean | null
          is_pinned: boolean | null
          lecture_id: string | null
          title: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_closed?: boolean | null
          is_pinned?: boolean | null
          lecture_id?: string | null
          title?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_closed?: boolean | null
          is_pinned?: boolean | null
          lecture_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completion_date: string | null
          completion_status:
            | Database["public"]["Enums"]["completion_status"]
            | null
          course_id: string | null
          created_at: string | null
          enrollment_date: string | null
          id: string
          last_accessed: string | null
          progress: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completion_date?: string | null
          completion_status?:
            | Database["public"]["Enums"]["completion_status"]
            | null
          course_id?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          last_accessed?: string | null
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completion_date?: string | null
          completion_status?:
            | Database["public"]["Enums"]["completion_status"]
            | null
          course_id?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          last_accessed?: string | null
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_messages: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          instructor_id: string
          is_announcement: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          instructor_id: string
          is_announcement?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          instructor_id?: string
          is_announcement?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_messages_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          lecture_id: string
          progress: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lecture_id: string
          progress?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lecture_id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lecture_progress_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecture_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lectures: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          description: string | null
          duration: number | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          module_id: string | null
          notes: string | null
          sequence_order: number | null
          title: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          description?: string | null
          duration?: number | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          notes?: string | null
          sequence_order?: number | null
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          description?: string | null
          duration?: number | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          notes?: string | null
          sequence_order?: number | null
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lectures_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          sequence_order: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sequence_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sequence_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          notification_type: string | null
          related_entity_type: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          related_entity_type?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          related_entity_type?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"] | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          last_login: string | null
          name: string | null
          role: Database["public"]["Enums"]["role"]
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_login?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["role"]
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["role"]
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          points: number | null
          question_text: string | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          quiz_id: string | null
          sequence_order: number | null
        }
        Insert: {
          id?: string
          points?: number | null
          question_text?: string | null
          question_type?: Database["public"]["Enums"]["question_type"] | null
          quiz_id?: string | null
          sequence_order?: number | null
        }
        Update: {
          id?: string
          points?: number | null
          question_text?: string | null
          question_type?: Database["public"]["Enums"]["question_type"] | null
          quiz_id?: string | null
          sequence_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizAttempts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          quiz_id: string | null
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["quiz_status"] | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["quiz_status"] | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["quiz_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizAttempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizAttempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizResponses: {
        Row: {
          answer_id: string | null
          attempt_id: string | null
          created_at: string
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string | null
          response_text: string | null
        }
        Insert: {
          answer_id?: string | null
          attempt_id?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          response_text?: string | null
        }
        Update: {
          answer_id?: string | null
          attempt_id?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          response_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizResponses_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizResponses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "discussionPosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizResponses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          available_from: string | null
          available_to: string | null
          created_at: string
          description: string | null
          id: string
          lecture_id: string | null
          max_attempts: number | null
          passing_score: number | null
          time_limit_minutes: number | null
          title: string | null
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lecture_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title?: string | null
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lecture_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string | null
          created_at: string
          feedback: string | null
          file_url: string | null
          grade: number | null
          graded_by: string | null
          id: string
          submission_text: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_by?: string | null
          id?: string
          submission_text?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_by?: string | null
          id?: string
          submission_text?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      systemSettings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string | null
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "systemSettings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      userProgress: {
        Row: {
          completed_at: string | null
          completion_status:
            | Database["public"]["Enums"]["completion_status"]
            | null
          course_id: string | null
          created_at: string
          id: string
          last_accessed: string | null
          lecture_id: string | null
          progress_percentage: number | null
          update_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_status?:
            | Database["public"]["Enums"]["completion_status"]
            | null
          course_id?: string | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          lecture_id?: string | null
          progress_percentage?: number | null
          update_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_status?:
            | Database["public"]["Enums"]["completion_status"]
            | null
          course_id?: string | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          lecture_id?: string | null
          progress_percentage?: number | null
          update_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "userProgress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "userProgress_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: true
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "userProgress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_storage_policies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "deleted"
      completion_status: "not_started" | "in_progress" | "completed"
      content_type: "video" | "text" | "quiz" | "assignment" | "file"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      question_type: "multiple_choice" | "true_false" | "short_answer" | "essay"
      quiz_status: "in_progress" | "completed" | "graded"
      role: "student" | "creator" | "admin"
      status: "draft" | "published" | "archive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "deleted"],
      completion_status: ["not_started", "in_progress", "completed"],
      content_type: ["video", "text", "quiz", "assignment", "file"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      question_type: ["multiple_choice", "true_false", "short_answer", "essay"],
      quiz_status: ["in_progress", "completed", "graded"],
      role: ["student", "creator", "admin"],
      status: ["draft", "published", "archive"],
    },
  },
} as const
