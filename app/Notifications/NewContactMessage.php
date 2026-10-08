<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewContactMessage extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Message $message) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Новое сообщение с сайта: '.($this->message->subject ?: 'без темы'))
            ->greeting('Новое сообщение через форму обратной связи')
            ->line('От: '.$this->message->name.' <'.$this->message->email.'>')
            ->lineIf((bool) $this->message->phone, 'Телефон: '.$this->message->phone)
            ->line($this->message->body)
            ->action('Открыть в панели управления', url('/admin/messages/'.$this->message->id));
    }
}
